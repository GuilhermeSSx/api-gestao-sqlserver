"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = require("./routes/user.routes");
// import { getUsers } from "./modules/user/UserRepository";
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
app.use('/user', user_routes_1.userRoutes);
app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});
// async function start() {
//     const results = await getUsers();
//     console.log(results);
// }
// start();
app.listen(4000, () => {
    console.log("[ server start : port 4000 - OK ]");
});
