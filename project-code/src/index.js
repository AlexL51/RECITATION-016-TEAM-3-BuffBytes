// *********************************
// <!-- Section 1 : Dependencies-->
// *********************************

// importing the dependencies
// Express is a NodeJS framework that, among other features, allows us to create HTML templates.
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require("http"); 
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// Change app settings

app.set('view engine', 'ejs');
app.use(bodyParser.json());


// ***********************************
// Database Initialization
// ***********************************

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

// Test Database Endpoint
app.get('/testDatabase', function (req, res) {
  console.log('Testing database!');

  var getUsersQuery = `select * from users;`;

  db.any(getUsersQuery)
    .then(queryResult => {
      // Success
      console.log("Success!")
      // QueryResult tested and works
      res.render("pages/testDatabase", {
        queryResult
      });

    })
    .catch(function (err) {
      console.log(err);
    });
});

// ****************************************************
// Real Endpoints
// ****************************************************

// Default Endpoint
app.get('/', (req, res)=>{
  res.redirect('/login');
});

app.get('/login', (req, res)=>{
    res.render('pages/login.ejs');
});

app.post('/login', async (req, res)=>{
  res.render('pages/login.ejs');
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

  async function hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      console.error(error);
      throw new Error('Error while hashing password');
    }
  }

  const hashedPassword = hashPassword(req.body.password)
    .then((hash) => {
      console.log('Hash:', hash);
    })
    .catch((error) => {
      console.error(error);
    });

    const query = `INSERT INTO users (username, profile_image, password, description) 
          values ($1, 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', $2, 'Add a description of yourself here.');`
    db.any(query, [req.body.username, hashedPassword])
    .then(function(data) {
        res.redirect('/login');
    })
    .catch(function(err){
      console.log(err);
      res.redirect('/register');
    })
});

app.get('/home', (req, res) => {
  db.any('SELECT * FROM topics')
    .then((topics) => {
      res.render('pages/home', { 
        topics: topics
        });
    })
    .catch((error) => {
      console.log(error);
      res.send('Error fetching topics');
    });
});

app.get('/logout', (req, res)=>{
  req.session.user = null;
  req.session.delete();
  res.render('pages/login.ejs', {message: 'logged out successfully'});
})

// *********************************
// Start Server
// *********************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
  console.log('listening on port 3000');
});