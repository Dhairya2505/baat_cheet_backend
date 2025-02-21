import express from 'express'
import CORS from 'cors'
import cookieParser from 'cookie-parser'
import { WebSocketServer, WebSocket } from 'ws'
import { config } from 'dotenv'
config()

import { signup } from './routes/signup';
import { valid_token } from './routes/valid_token'
import { signin } from './routes/signin'

import UserDuplicacy from "./middlewares/UserDuplicacy";
import CheckUser from './middlewares/CheckUser'


const app = express()
const httpServer = app.listen(process.env.PORT || 8000)

const room_app = express()
const roomServer = room_app.listen(process.env.PORT || 8001)

app.use(CORS({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())


app.post('/signup', UserDuplicacy, signup)
app.get(`/signin`, CheckUser, signin)
app.get(`/valid_token`, valid_token)


const users: Record<string, WebSocket | null> = {};
const rooms: Record<string, Record<string, Record<string, WebSocket>>> = {}

// {
//   "room_id": {
//     "room_name": {
//       "username": websocket,
//       "username": websocket
//     }
//   },
//   "room_id": {
//     "room_name": {
//       "username": websocket,
//       "username": websocket
//     }
//   } 
// }

const messages: {[key: string]: {[key: string]: string}[]}[] = []

// [
      // {
      //   'user_fromuser_to': [
      //     {"user_from": messages},
      //     {"user_to": message}
      //   ]
      // },
      // {
      //   'user_fromuser_to': [
      //     {"user_from": messages},
      //     {"user_to": message}
      //   ]
      // }
// ]

const room_messages: {[key: string]: {[key: string]: string}[]}[] = []

// [
//   {
//     'room_id':[
//       {"user_from": message},
//       {"user_from": message},
//     ]
//   },
//   {
//     'room_id':[
//       {"user_from": message},
//       {"user_from": message},
//     ]
//   }
// ]


const wss = new WebSocketServer({ server: httpServer });
wss.on('connection', function socket_handler(ws){

  ws.on('error', console.error);

  ws.on('message', function message(data: any, isBinary: boolean) {
      // wss.clients.forEach(function each(client: any) {
      //     if (client.readyState === WebSocket.OPEN) {
      //         client.send(data, { binary: isBinary });
      //     }
      // });
      data = JSON.parse(data.toString())
      switch (data.event) {
          case "token":
            if(data.username){
              users[data.username] = ws
              let groups: Record<string, Record<string, string>> = {}
              for(const room_id in rooms){
                for(const room_name in rooms[room_id]){
                  for(const user in rooms[room_id][room_name]){
                    if(user == data.username){
                      if(groups[room_id]){
                          if(groups[room_id][room_name]){
                            groups[room_id][room_name] = ""
                          } else {
                            groups[room_id] = {
                              [room_name]: ""
                            }
                          }
                      } else {
                        groups = {
                          [room_id]: {
                            [room_name]: ""
                          }
                        }
                      }
                    }
                  }
                }
              }
              wss.clients.forEach(function each(client) {
                try {
                  client.send(JSON.stringify({
                    event: "users",
                    users,
                    groups
                  }))
                } catch (error) {
                  
                }
              })
            }
            break;

          case "close":
            users[data.username] = null;
            break;

          case "get-chats":
              const from = data.from_user;
              const to = data.to_user;
              messages.map((messageObj) => {
              
                return Object.entries(messageObj).map(([key, messageArray]) => {
                  if(key == `${from}${to}` || key == `${to}${from}`){
                    ws.send(JSON.stringify({
                        event: "recieve-chats",
                        chats: messageArray
                    })) 
                  }
                });

              });
              break;

          case "send-message":
              const _to = data.to
              const _from = data.from
              const message = data.message
              let found = false;

              messages.map((messageObj) => {
                Object.entries(messageObj).map(([key, messageArray]) => {
                  if(key == `${_from}${_to}` || key == `${_to}${_from}`){
                    found = true;
                    messageArray.push({[_from]: message})
                    const socket = users[_to]
                    if(socket){
                      socket.send(JSON.stringify({
                        event: "recieve-chat",
                        from: _from,
                        to: _to,
                        message: message
                      }))
                    }
                  }                  
                });
              });
              if(!found){
                let array = [{[_from]: message}]
                messages.push({
                  [`${_to}${_from}`]: array
                })
                const socket = users[_to]
                if(socket){
                  socket.send(JSON.stringify({
                    event: "recieve-chat",
                    from: _from,
                    message: message
                  }))
                }
              }
              break;

          default:
              break;
      }

  });

});

const rss = new WebSocketServer({ server: roomServer });
rss.on('connection', function socket_handler(rs){

  rs.on('error', console.error);

  rs.on('message', function message(data: any, isBinary: boolean){
    
    data = JSON.parse(data.toString())
    
    switch (data.event) {
      case "token":
        const room_id = data.room_id;
        const room_name = data.room_name;
        const username = data.username;
        if(rooms[room_id]){
          if(rooms[room_id][room_name]){
            rooms[room_id][room_name][username] = rs;
          } else {
            rooms[room_id][room_name] = {
              [username]: rs
            }
          }
        } else {
          rooms[room_id] = {
            [room_name]: {
              [username]: rs
            }
          }
        }

        break;

      case "get-chats":
        const room = data.room_id;
        room_messages.map((messageObj) => {
          Object.entries(messageObj).map(([key, messageArray]) => {
            if(key == room){
              rs.send(JSON.stringify({
                  event: "recieve-chats",
                  chats: messageArray
              })) 
            }
          })
        })

        break;

      case "send-message":
        const _from = data.username
        const message = data.message
        const roomID = data.room_id
        const roomName = data.room_name;
        let found = false;

        room_messages.map((messageObj) => {
          Object.entries(messageObj).map(([key, messageArray]) => {
            if(key == roomID){
              found = true;
              messageArray.push({[_from]: message})
              
              for (const room in rooms){
                if(room == roomID){
                  for(const room_Name in rooms[room]){
                    if(room_Name == roomName){
                      for(const user in rooms[room][room_Name]){
                        rooms[room][room_Name][user].send(JSON.stringify({
                          event: "recieve-message",
                          roomID,
                          _from,
                          message
                        }))
                      }
                    }
                  }
                }
              }
            }                  
          });
        });
        if(!found){
          let array = [{[_from]: message}]
          room_messages.push({
            [`${roomID}`]: array
          })
          for (const room in rooms){
            if(room == roomID){
              for(const room_Name in rooms[room]){
                if(room_Name == roomName){
                  for(const user in rooms[room][room_Name]){
                    rooms[room][room_Name][user].send(JSON.stringify({
                      event: "recieve-message",
                      roomID,
                      _from,
                      message
                    }))
                  }
                }
              }
            }
          }
        }
        break;
    
      default:
        break;
    }
  
  })

})