CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  image_link VARCHAR(255) NOT NULL,
  description TEXT
);
