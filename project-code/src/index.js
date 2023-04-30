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


// Custom stylesheets

app.use(express.static('resources'));

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

app.post('/add_topic', function (req, res) {
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
          message: 'Post Added Successfully',
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


app.post('/add_comment/:post_id/:chain', function (req, res) {
  var topic1 = req.params.post_id;
  var chain1 = req.params.chain; //Is currently a INT, though will be used for nesting if we ever get there.
  var comm1 = req.body.body;
  if (topic1 != null && comm1 != null){
    const query = `insert into comments (comment_id, post_id, user_id, chain, body) values ((SELECT max(comment_id)+1 FROM comments),'${topic1}','${req.session.user.user_id}','${chain1}', '${comm1}')  returning * ;`;//    const query = `insert into comments (post_id, user_id, chain, body) values ('${topic1}','${req.session.user.user_id}', '${chain1}','${comm1}')  returning * ;`;
    db.any(query, [
      req.params.post_id,
      req.session.user.user_id,
      req.body.body,
      req.body.chain1,
    ])
      // if query execution succeeds
      // send success message
      .then(function (data) {
        //res.status(201).json({
        //  status: 'success',
        //  data: data,
        //  message: 'Comment Added Successfully',
        //});
        console.log(data);
        res.redirect('/comments/'+topic1);
      })
      // if query execution fails 
      // send error message
      .catch(function (err) {
        return console.log(err);
      });
  }

  else{
    res.render('pages/home',{
    message: "Topic Title or Body Was Empty, Comment Not Posted",
    }); 
  }
});



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
  //var newId;
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
    const query = `INSERT INTO users (user_id, username, profile_image, password, description) 
          values ((SELECT max(user_id)+1 FROM users), $1, 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', $2, 'Add a description of yourself here.');`
    db.any(query, [ req.body.username, hashedPassword])
    .then(function(data) {
        res.redirect('/login');
    })
    .catch(function(err){
      console.log(err);
      res.redirect('/register');
    })
});

app.get('/home', (req, res) => {
  const query = "SELECT t.post_id, u.username, u.profile_image, t.subject, t.body FROM topics t JOIN users u ON t.user_id = u.user_id"; 
  db.any(query)
    .then((topics) => {
      const query2 = "SELECT COUNT(*), post_id FROM comments GROUP BY post_id;";
      db.any(query2)
        .then((commentCount)=>{
          res.render('pages/home', { 
            topics: topics,
            comments: commentCount
            });
        })
        .catch((error)=>{
          console.log(error);
          res.send('Error fetching comments');
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
  req.session.save();
  res.render('pages/login.ejs', {message: 'logged out successfully'});
})

// Profile Page
app.get('/profile', (req, res)=>{
  console.log("Profile GET request");
 
  // If the user isn't logged in, redirect to the login page.
  if (req.session.user === null) {
    res.render('pages/login.ejs');
    return;
  };
  
  // Ask database for info about the current user
  const userQuery = `SELECT * FROM users WHERE username = $1;`;
  const topicQuery = 'SELECT * FROM topics WHERE user_id = $1 ORDER BY post_id DESC;';
  try {
    var username = req.session.user.username;
  }
  catch(err) {
    console.log(err);
    res.redirect('/home');
  }
  
  db.task('get-profile', async function (t) { 
    const user = await t.oneOrNone(userQuery, username); 
    if(!user) { 
      throw new Error('User not found');
    }
    const topics = await t.any(topicQuery, user.user_id); 
    return { user, topics }; 
  })
  .then(({user, topics}) => { 
    res.render('pages/profile.ejs', { 
      currUser: user, 
      userTopics: topics
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

// New Post Page

app.get('/add_post', (req, res) => {
  console.log("req.session.user: ", req.session.user);
  console.log("req.session.user[0]: ", req.session.user[0]);

  res.render('pages/new_post_page.ejs', {
    currUser: req.session.user,
  });
});

// Add Post

app.post('/add_post', function (req, res) {
  console.log("add_post POST request activated!");
  console.log("req.body for POST request: ", req.body); 

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
  } else {
    console.log("Activated else block.");
    res.redirect('home',{
    message: "Title or Body Was Empty, Topic Not Posted",
    }); 
  }
  res.redirect('home');
});


app.get('/comments/:post_id', (req, res)=>{
  console.log(req.params.post_id);
  const currentUser = req.session.user.user_id;
  const query = "SELECT topics.*, users.username FROM topics JOIN users ON topics.user_id = users.user_id WHERE post_id = $1;";
  db.any(query, [req.params.post_id])
  .then(function(data){
    const query2 = "SELECT * FROM comments WHERE post_id = $1 ORDER BY comment_id;";
    console.log(data);
    db.any(query2, [req.params.post_id])
    .then(function(data1){
      console.log(data1);
      const query3 = "SELECT * FROM users ORDER BY user_id;";
      db.any(query3)
      .then(function(data2){
        console.log(data2);
        res.render('pages/post.ejs', {topic: data[0], 
                                    comments: data1,
                                    users: data2,
                                    curr_user_id: currentUser,});
      })
      .catch(function(err){
        console.log(err);
      })
        
    })
    .catch(function(err){
      console.log(err);
    });
  })
  .catch(function(err){
    console.log(err);
  });
});

app.get('/newComment/:post_id/:chain/:user_id', (req,res)=>{
  const query = "SELECT * FROM comments WHERE post_id = $1 ORDER BY comment_id;";
  db.any(query,[req.params.post_id])
  .then(function(data){
    const query2 = "SELECT * FROM users ORDER BY user_id;";
    db.any(query2)
    .then(function(data1){
      const query3 = "SELECT topics.*, users.username FROM topics JOIN users ON topics.user_id = users.user_id WHERE post_id = $1;";
      db.any(query3,[req.params.post_id])
      .then(function(data2){
                res.render('pages/new_comment_page.ejs',{post_id: req.params.post_id,
                                    chain: req.params.chain,
                                    curr_user_id: req.params.user_id,
                                    comments: data,
                                    users: data1,
                                    topic: data2[0]});
      })
      .catch(function(error){
        console.log(error);
      });
    })
    .catch(function(error){
      console.log(error);
    });
  })
  .catch(function(error){
    console.log(error);
  });
});

// *********************************
// Start Server
// *********************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
  console.log('listening on port 3000');
});