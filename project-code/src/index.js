<<<<<<< HEAD
// *********************************
// <!-- Section 1 : Dependencies-->
// *********************************

// importing the dependencies
// Express is a NodeJS framework that, among other features, allows us to create HTML templates.
const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
require('dotenv').config();

// ***********************************
// <!-- Section 2 : Initialization-->
// ***********************************

// defining the Express app
const app = express();
// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());
// Database connection details
const dbConfig = {
  host: 'db',
  port: 5431,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
// Connect to database using the above details
const db = pgp(dbConfig);

// ****************************************************
// Test Endpoints
// ****************************************************

// <!-- Endpoint 1 :  Default endpoint ("/") -->
const message = 'Hey there!';
app.get('/', (req, res) => {
  res.send(message);
});

// Endpoint 2: Test Database
app.get('/testDatabase', function (req, res) {
  console.log('Testing database!');
  // Multiple queries using templated strings
  var getUsersQuery = `select * from users;`;
  // use task to execute multiple queries
  db.task('get-everything', task => {
    return task.batch([task.any(getUsersQuery)]);
  })
    // if query execution succeeds
    // query results can be obtained
    // as shown below
    .then(data => {
      res.render("pages/testDatabase", {
        data
      });
    })
    // if query execution fails
    // send error message
    .catch(err => {
      console.log('Endpoint 1 Failed');
      console.log(err);
      res.status(400).json({error: 'Failed to get data from database.'});
    });
});

// *********************************
// Start Server
// *********************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
  console.log('listening on port 3000');
});
=======
const http = require("http"); 

// Import Dependencies

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.


app.get('/', (req, res)=>{
  res.redirect('/login');
});


app.get('/login', (req, res)=>{
    res.render('pages/login.ejs');
});

app.post('/login', async (req, res)=>{
    const query = "SELECT * FROM users WHERE (username = $1);";
    db.any(query,[req.body.username])
    .then(async (data)=>{
      const user = data;
      console.log(data);
      const match = await bcrypt.compare(req.body.password, data[0].password);
      if(match){
        req.session.user = user;
        req.session.save();
        res.redirect('/home');
      }
      else{
        res.redirect('/register');
      }
    })
    .catch(function(err){
      console.log(err);
      res.render('pages/login.ejs', {message: 'Incorrect username or password.'});
    })
});



app.get('/register', (req, res)=>{
    res.render('pages/register.ejs');
});


app.post('/register', async (req,res)=>{
    //still need to come up with a place holder image when they register.
    const hash = await bcrypt.hash(req.body.password, 10);
    const query = 'INSERT INTO users (username, password) values ($1, $2);';
    db.any(query,[req.body.username, hash])
    .then(function(data) {
        res.redirect('/login');
    })
    .catch(function(err){
      console.log(err);
      res.redirect('/register');
    })
});

app.get('/home', (req,res)=>{
    res.render('pages/home.ejs');
});

// Star the server
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');
>>>>>>> 8f63f2872eef675747086709ec25c661d493ea79
