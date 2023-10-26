import express from 'express';
import { userRoutes } from './routes/user.routes';
import { config } from 'dotenv';

config();
const app = express();

const cors = require('cors');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000, https://jpnr-gestao.vercel.app/, https://jpnr-gestao-guilhermessx.vercel.app/, https://jpnr-gestao-git-main-guilhermessx.vercel.app/ ");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use(cors());

app.use(express.json());
app.use('/user', userRoutes);

app.get('/', (req, res) => {
    res.send('Bem-vindo à API JPNR Gestão!');
});

//criar o servidor
app.listen(4000, function(){
    console.log("[ server start : port 4000 - OK ]"); 
});