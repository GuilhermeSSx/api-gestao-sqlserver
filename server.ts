import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/user.routes';
// import { getUsers } from "./modules/user/UserRepository";

config();

const app = express();

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use('/user', userRoutes);

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
