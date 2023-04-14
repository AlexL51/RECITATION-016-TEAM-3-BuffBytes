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
// <!-- Section 3 : Examples Enpoint Implementation-->
// ****************************************************

// <!-- Endpoint 1 :  Default endpoint ("/") -->
const message = 'Hey there!';
app.get('/', (req, res) => {
  res.send(message);
});


// ************************************************
// <!-- Section 4 : TODOs Endpoint Implementation-->
// ************************************************

// Define app routes

// Note: Router.get breaks the connection. Don't define an express router.

// < !-- Endpoint 1:  Get User Details ("/getUserInfo") -->
app.get('/getUserInfo', function (req, res) {
  // Fetch query parameters from the request object
  var username = req.query.username;
  var city = req.query.city;

  // Multiple queries using templated strings
  var current_user = `select * from userinfo where username = '${username}';`;
  var city_users = `select * from userinfo where city = '${city}';`;

  // use task to execute multiple queries
  db.task('get-everything', task => {
    return task.batch([task.any(current_user), task.any(city_users)]);
  })
    // if query execution succeeds
    // query results can be obtained
    // as shown below
    .then(data => {
      res.status(200).json({
        current_user: data[0],
        city_users: data[1],
      });
    })
    // if query execution fails
    // send error message
    .catch(err => {
      console.log('Uh Oh spaghettio');
      console.log(err);
      res.status('400').json({
        current_user: '',
        city_users: '',
        error: err,
      });
    });
});

// <!-- Endpoint 2:  Get Top 3 California Trails -->

app.get('/topTrails', function (req, res) {

  const query = `\
  select trails.name, AVG(reviews.rating) AS avg_rating \
  from trails \
  join trails_to_reviews ON trails_to_reviews.trail_id = trails.trail_id \
  join reviews on reviews.review_id = trails_to_reviews.review_id \
  group by trails.name \
  order by avg_rating desc \
  limit 3;`
  
  db.any(query)
    .then(data => {
      // Success
      console.log("Success!")
      res.status(200).json({
          status: 'success',
          data: data,
          message: 'Retrieved Top 3 Trails'
        });
    })
    .catch(function (err) {
      return next(err);
    });
});

// <!-- Endpoint 3:  Post a New Review -->

app.post('/newReview', function (req, res) {
  // Should handle a request to add a review with or without image deatails.
  // The route should return Data added successfully message, review_id and image_id (If image details are provided by the user) to the client after the review has been added to the database.
  // Save response (in adddition to saving review_id and image_id in the database already?)

  const username = req.query.username;
  const review_body = req.query.review_body;
  const review_rating = req.query.review_rating;
  const trail_name = req.query.trail_name;
  const image_caption = req.query.image_caption;
  const image_url = req.query.image_url;

  console.log("Logging input parameters:");
  console.log("Username: ", username);
  console.log("Review Body: ", review_body);
  console.log("Review Rating: ", review_rating);
  console.log("Trail Name: ", trail_name);
  console.log("Image Caption: ", image_caption);
  console.log("Image URL: ", image_url);

  // Write add review query
  var new_review_query_no_img = `
    WITH review_insert AS (
      INSERT INTO reviews (username, review, rating)
      VALUES ('${username}', '${review_body}', '${review_rating}')
      RETURNING review_id
    )
    INSERT INTO trails_to_reviews (trail_id, review_id)
    SELECT trail_id, (SELECT review_id FROM review_insert)
    FROM trails
    WHERE name = '${trail_name}'
    RETURNING (select review_id FROM review_insert);
    `.trim();

  var new_review_query_img = `
    WITH review_insert AS (
      INSERT INTO reviews (username, review, rating)
      VALUES ('${username}', '${review_body}', '${review_rating}')
      RETURNING review_id
    ), image_insert AS (
      INSERT INTO images (image_url, image_caption)
      VALUES ('${image_url}', '${image_caption}')
      RETURNING image_id
    )

    INSERT INTO trails_to_reviews (trail_id, review_id)
    SELECT trail_id, (SELECT review_id FROM review_insert)
    FROM trails
    WHERE name = '${trail_name}'
    RETURNING (SELECT review_id FROM review_insert) , (SELECT image_id FROM image_insert);`.trim();

  if (!rating) {
    return res.status(400).json({error: "Missing required field: rating"});
  }
  
  if (image_url) {
    console.log("Doing POST with an image.");
    db.any(new_review_query_img)
    .then(data => {
      // Success
      console.log("POSTed with an Image")
      const reviewID = data[0]['review_id'];
      const imageID = data[0]['image_id'];
      res.status(200).json({
          status: 'success',
          review_id: reviewID,
          image_id: imageID,
          message: 'Posted new review with an image.'
        });
    })
    .catch(function (err) {
      return err;
    });
  }  

  if (!image_url || image_url.trim().length === 0) {
    db.any(new_review_query_no_img)
    .then(data => {
      // Success
      const reviewID = data[0]['review_id'];
      res.status(200).json({
          status: 'success',
          review_id: reviewID,
          message: 'Posted new review without an image.'
        });
    })
    .catch(function (err) {
      return err;
    });
  }
});

// <!-- Endpoint 4:  Update Review -->

app.put('/updateReview', function (req, res) {
  // The user should be able to change the text or update an image. When processing the request, 
  // the route should check if the user is sending new data for the text or a new image, or both, and accordingly update the appropriate tables.
  // The user will be sending the review_id and image_id (You can use the review_id and image_id obtained from the previous POST request) when making this PUT request.
  // The route should return "Data updated Successfully" message to the client after the review has been updated in the database.
  
  // Fetch query parameters from the request object
  const review_id = req.query.review_id;
  const image_id = req.query.image_id;
  const new_text = req.query.new_text;
  const new_rating = req.query.new_rating;
  const new_user = req.query.new_user;
  const new_image_url = req.query.new_image_url;
  const new_image_caption = req.query.new_image_caption;

  console.log("Logging input parameters:");
  console.log("Review ID: ", review_id);
  console.log("Image ID: ", image_id);
  console.log("New Text: ", new_text);
  console.log("New Rating: ", new_rating);
  console.log("New User: ", new_user);
  console.log("New Image URL: ", new_image_url); 
  console.log("New Image Caption: ", new_image_caption)


  //Write Queries
  if (!review_id) {
    // Request Fails 
    return res.status(400).json({error: 'Missing required fields: review_id'});
  }
  
  if(!image_id) {
    // Update review without an image
    console.log("No image ID.")

    // We request an update to the review txt without a corresponding update to the image
    var query = `\
    UPDATE reviews SET review = '${new_text}', rating = '${new_rating}', username = '${new_user}' 
    WHERE review_id = '${review_id}';
    `.trim();


    db.any(query)
    .then(data => {
      // Success
      console.log("Inside the query now!")
      console.log("Query: ", query)
      // return_review_id = data[0].reviewID;
      res.status(200).json({
          status: 'success',
          message: 'Data updated successfully: updated review text.'
        });
    })
    .catch(function (err) {
      return err;
    });
  }

  if(image_id) {
    // Request an update to the review text and an update to the image ID
    // Update review with an image.
    // We request an update to the review txt without a corresponding update to the image
    var query = `\
    UPDATE reviews SET review = '${new_text}', rating = '${new_rating}', username = '${new_user}' 
    WHERE review_id = '${review_id}';
    UPDATE images SET image_url = '${new_image_url}', image_caption = '${new_image_caption}'
    WHERE image_id = ${image_id};
    `.trim();

    db.any(query)
    .then(data => {
      // Success
      console.log("Inside the query now!")
      console.log("Query: ", query)
      // return_review_id = data[0].reviewID;
      res.status(200).json({
          status: 'success',
          message: 'Data updated successfully: updated review text and an image.'
        });
    })
    .catch(function (err) {
      return err;
    });
  }
});

// <!-- Endpoint 5: Delete Review -->

app.delete('/deleteReview', function(req, res) {
  const review_id = req.query.review_id;

  // Check if the required parameters are present
  if (!review_id) {
    return res.status(400).json({ error: 'Missing required fields: review_id' });
  }

  const query = `DELETE FROM trails_to_reviews WHERE review_id = '${review_id}';\
  DELETE FROM reviews_to_images WHERE review_id = '${review_id}';\
  DELETE FROM reviews WHERE review_id = '${review_id}';`

  // Delete the review from the reviews table
  db.none(query)
    .then(() => {
    })
    .then(() => {
      res.status(200).json({ status: 'success', message: `Review with ID ${review_id} deleted successfully` });
    })
    .catch(err => {
      console.error('Error deleting review:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// <!-- Endpoint 6: GET for Searching by Filter -->

app.get('/getTrails', function (req, res) {

  // Make sure to check individually whether each search filter is null or not.

  var difficulty = req.query.difficulty || "NULL";
  var location = req.query.location || "NULL";
  var elevation_gain = req.query.elevation_gain || "NULL";
  var avg_rating = req.query.avg_rating ||  "NULL";

  console.log("difficulty: ", difficulty)
  console.log("location: ", location)
  console.log("elevation_gain: ", elevation_gain)
  console.log("avg_rating: ", avg_rating)


  // Build query based on which strings are null and non-null:

  if (difficulty == "NULL" && location == "NULL" && elevation_gain == "NULL" && avg_rating == "NULL") {
    res.status(400).send('Bad Request: No filters provided.');
  }
  else {
    var query = `
    SELECT trails.name
    FROM trails
    WHERE
    `
  
    var first_concat = true;
  
    if(difficulty != "NULL") {
      if (first_concat == true) {
        query = query.concat(`(difficulty = '${difficulty}')`);
        first_concat = false;
      }
      else {
        query = query.concat(`AND (difficulty = '${difficulty}')`);
      }
    }
  
    if(location != "NULL") {
      if (first_concat == true) {
        query = query.concat(`(location = '${location}')`);
        first_concat = false;
      }
      else {
        query = query.concat(`AND (location = '${location}')`);
      }
    }
  
    if(elevation_gain != "NULL") {
      if (first_concat == true) {
        query = query.concat(`(elevation_gain = '${elevation_gain}')`);
        first_concat = false;
      }
      else {
        query = query.concat(`AND (elevation_gain = '${elevation_gain}')`);
      }
    }
  
    if(avg_rating != "NULL") {
      if (first_concat == true) {
        query = query.concat(`(avg_rating = '${avg_rating}')`);
      }
      else {
        query = query.concat(`AND (avg_rating = '${avg_rating}')`);
      }
    }
    
    query = query.concat();
  
    db.any(query)
      .then(data => {
        // Success
        res.status(200).json({
            status: 'success',
            data: data,
            message: 'Retrieved Results of Search'
          });
      })
      .catch(function (err) {
        return err;
      });
  }
});

// <!-- Endpoint 7: GET a Trail Name by ID -->

app.get('/getTrailsByID', function (req, res) {

  // Make sure to check individually whether each search filter is null or not.

  var trail_id = req.query.trail_id;

  var query = `
  SELECT trails.name
  FROM trails
  WHERE trails.trail_id = ${trail_id};
  `
  
  db.any(query)
    .then(data => {
      // Success
      res.status(200).json({
          status: 'success',
          data: data,
          message: 'Retrieved Results of Search'
        });
    })
    .catch(function (err) {
      return err;
    });
});

// *********************************
// <!-- Section 5 : Start Server-->
// *********************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
  console.log('listening on port 3000');
});