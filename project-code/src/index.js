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
  port: 5432,
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