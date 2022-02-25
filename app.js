require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');



const app = express();
app.use(express.json());


routes(app);
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.k0ycv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`).then(() => {
  app.listen(8000, () => {
    console.log("Servidor rodando");
  })
}).catch(error => console.log(error));
