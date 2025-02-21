"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ws_1 = require("ws");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const signup_1 = require("./routes/signup");
const valid_token_1 = require("./routes/valid_token");
const signin_1 = require("./routes/signin");
const UserDuplicacy_1 = __importDefault(require("./middlewares/UserDuplicacy"));
const CheckUser_1 = __importDefault(require("./middlewares/CheckUser"));
const app = (0, express_1.default)();
const httpServer = app.listen(process.env.PORT || 8000);
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.post('/signup', UserDuplicacy_1.default, signup_1.signup);
app.get(`/signin`, CheckUser_1.default, signin_1.signin);
app.get(`/valid_token`, valid_token_1.valid_token);
const users = {};
const rooms = {};
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
const messages = [];
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
const room_messages = [];
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
const wss = new ws_1.WebSocketServer({ server: httpServer });
wss.on('connection', function socket_handler(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data, isBinary) {
        data = JSON.parse(data.toString());
        switch (data.event) {
            case "token":
                if (data.username) {
                    users[data.username] = ws;
                    let groups = {};
                    for (const room_id in rooms) {
                        for (const room_name in rooms[room_id]) {
                            for (const user in rooms[room_id][room_name]) {
                                if (user == data.username) {
                                    if (groups[room_id]) {
                                        if (groups[room_id][room_name]) {
                                            groups[room_id][room_name] = "";
                                        }
                                        else {
                                            groups[room_id] = {
                                                [room_name]: ""
                                            };
                                        }
                                    }
                                    else {
                                        groups = {
                                            [room_id]: {
                                                [room_name]: ""
                                            }
                                        };
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
                            }));
                        }
                        catch (error) {
                        }
                    });
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
                        if (key == `${from}${to}` || key == `${to}${from}`) {
                            ws.send(JSON.stringify({
                                event: "recieve-chats",
                                chats: messageArray
                            }));
                        }
                    });
                });
                break;
            case "send-message":
                const _to = data.to;
                const _from = data.from;
                const message = data.message;
                let found = false;
                messages.map((messageObj) => {
                    Object.entries(messageObj).map(([key, messageArray]) => {
                        if (key == `${_from}${_to}` || key == `${_to}${_from}`) {
                            found = true;
                            messageArray.push({ [_from]: message });
                            const socket = users[_to];
                            if (socket) {
                                socket.send(JSON.stringify({
                                    event: "recieve-chat",
                                    from: _from,
                                    to: _to,
                                    message: message
                                }));
                            }
                        }
                    });
                });
                if (!found) {
                    let array = [{ [_from]: message }];
                    messages.push({
                        [`${_to}${_from}`]: array
                    });
                    const socket = users[_to];
                    if (socket) {
                        socket.send(JSON.stringify({
                            event: "recieve-chat",
                            from: _from,
                            message: message
                        }));
                    }
                }
                break;
            case "room-token":
                const room_id = data.room_id;
                const room_name = data.room_name;
                const username = data.username;
                if (rooms[room_id]) {
                    if (rooms[room_id][room_name]) {
                        rooms[room_id][room_name][username] = ws;
                    }
                    else {
                        rooms[room_id][room_name] = {
                            [username]: ws
                        };
                    }
                }
                else {
                    rooms[room_id] = {
                        [room_name]: {
                            [username]: ws
                        }
                    };
                }
                break;
            case "get-room-chats":
                const room = data.room_id;
                room_messages.map((messageObj) => {
                    Object.entries(messageObj).map(([key, messageArray]) => {
                        if (key == room) {
                            ws.send(JSON.stringify({
                                event: "recieve-room-chats",
                                chats: messageArray
                            }));
                        }
                    });
                });
                break;
            case "send-room-message":
                const from_ = data.username;
                const _message = data.message;
                const roomID = data.room_id;
                const roomName = data.room_name;
                let _found = false;
                room_messages.map((messageObj) => {
                    Object.entries(messageObj).map(([key, messageArray]) => {
                        if (key == roomID) {
                            _found = true;
                            messageArray.push({ [from_]: _message });
                            for (const room in rooms) {
                                if (room == roomID) {
                                    for (const room_Name in rooms[room]) {
                                        if (room_Name == roomName) {
                                            for (const user in rooms[room][room_Name]) {
                                                rooms[room][room_Name][user].send(JSON.stringify({
                                                    event: "recieve-room-message",
                                                    roomID,
                                                    _from: from_,
                                                    message: _message
                                                }));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                });
                if (!_found) {
                    let array = [{ [from_]: _message }];
                    room_messages.push({
                        [`${roomID}`]: array
                    });
                    for (const room in rooms) {
                        if (room == roomID) {
                            for (const room_Name in rooms[room]) {
                                if (room_Name == roomName) {
                                    for (const user in rooms[room][room_Name]) {
                                        rooms[room][room_Name][user].send(JSON.stringify({
                                            event: "recieve-room-message",
                                            roomID,
                                            _from: from_,
                                            message: _message
                                        }));
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
    });
});
