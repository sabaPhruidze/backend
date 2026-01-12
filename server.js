//here we will import .dotenv in order to than use hidden Token, secret keys and port using process.env
require("dotenv").config();
// //let's install express in order to make the process of creating server easier
// const express = require("express");
// const app = express();
const port = process.env.PORT;
console.log(port);
