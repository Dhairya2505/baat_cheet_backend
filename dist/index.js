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
const wss = new ws_1.WebSocketServer({ server: httpServer });
wss.on('connection', function socket_handler(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data, isBinary) {
        // wss.clients.forEach(function each(client: any) {
        //     if (client.readyState === WebSocket.OPEN) {
        //         client.send(data, { binary: isBinary });
        //     }
        // });
        data = JSON.parse(data.toString());
        switch (data.event) {
            case "token":
                if (data.username) {
                    users[data.username] = ws;
                    wss.clients.forEach(function each(client) {
                        try {
                            client.send(JSON.stringify({
                                event: "users",
                                users
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
            default:
                break;
        }
    });
});
