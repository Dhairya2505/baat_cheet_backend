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
              wss.clients.forEach(function each(client) {
                try {
                  client.send(JSON.stringify({
                    event: "users",
                    users
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