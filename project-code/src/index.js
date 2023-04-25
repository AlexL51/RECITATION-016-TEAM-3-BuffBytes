// *********************************
// Dependencies
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

var request =express();


// *****************************************************
// Connect to Database
// *****************************************************

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


// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// App Settings
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

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

// Login

app.get('/login', (req, res)=>{
    res.render('pages/login.ejs');
});

app.post('/login', async (req, res)=>{
  console.log("Login POST Request");
  console.log("req.body: ", req.body);
  const query = "SELECT * FROM users WHERE (username = $1);";
  db.any(query,[req.body.username])
  .then(async (data)=>{
    const user = data[0];
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

// Register

app.get('/register', (req, res)=>{
    res.render('pages/register.ejs');
});

app.post('/register', async (req,res) => {

  console.log('req.body: ', req.body);

  console.log('req.body.username', req.body.username);
  console.log('req.body.password', req.body.password);


  // Define Hash password function
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

  // Take password from req.body.password and hash it.
  const hashedPassword = await hashPassword(req.body.password)
    .then((hash) => {
      console.log('Hash:', hash);
      return hash;
    })
    .catch((error) => {
      console.error(error);
    });

    console.log("hashedPassword: ", hashedPassword);
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
  const query = "SELECT t.post_id, u.username, t.subject, t.body FROM topics t JOIN users u ON t.user_id = u.user_id"; 
  db.any(query)
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

// Logout

app.get('/logout', (req, res)=>{
  req.session.user = null;
  req.session.delete();
  res.render('pages/login.ejs', {message: 'logged out successfully'});
})

// Profile Page
app.get('/profile', (req, res)=>{
  console.log("Profile GET request");
 
  // If the user isn't logged in, redirect to the login page.
  if (req.session.user === null) {
    res.render('pages/login.ejs');
  };
  
  // Ask database for info about the current user
  const query = `SELECT * FROM users WHERE username = $1;`;
  try {
    var username = req.session.user.username;
  }
  catch(err) {
    console.log(err);
    res.redirect('/home');
  }
  db.any(query, username)
  .then(queryResult => {
    res.render('pages/profile.ejs', {
      currUser: queryResult[0],
    });
  })
  .catch(function (err) {
    console.log(err);
    res.redirect('/home');
  });
  });


// New Post Page

app.get('/new_post_page', (req, res)=>{
  console.log("New post page request");
  res.render('pages/new_post_page.ejs');
 
  // If the user isn't logged in, redirect to the login page.
  if (req.session.user === null) {
    res.render('pages/login.ejs');
  };
  
  // Ask database for info about the current user
  try {
    var username = req.session.user.username;
  }
  catch(err) {
    console.log(err);
    res.redirect('/home');
  }
  db.any(query, username)
  .then(queryResult => {
    res.render('pages/profile.ejs', {
      currUser: queryResult[0],
    });
  })
  .catch(function (err) {
    console.log(err);
    res.redirect('/home');
  });
  });


// Add Post

app.post('/add_post', function (req, res) {
  var title1 = req.body.title;
  var post1 = req.body.post;
  if (title1 != null && post1 != null){
    const query = `insert into topics (user_id, subject, body) values ('${req.session.user.user_id}', '${title1}', '${post1}')  returning * ;`;
    db.any(query, [
      req.body.title1,
      req.body.post1,
    ])
      // if query execution succeeds
      // send success message
      .then(function (data) {
        res.status(201).json({
          status: 'success',
          data: data,
          message: 'post added successfully',
        });
      })
      // if query execution fails 
      // send error message
      .catch(function (err) {
        return console.log(err);
      });
  }

  else{
    res.render('pages/home',{
    message: "Title or Body Was Empty, Topic Not Posted",
    }); 
  }
});

// *********************************
// Start Server
// *********************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
  console.log('listening on port 3000');
});