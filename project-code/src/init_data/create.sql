-- Using path enumeration to store recursive comment threads in SQL. See slide 55 of this slidedeck:
-- https://www.slideshare.net/billkarwin/sql-antipatterns-strike-back?src=embed


CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  image_link VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE posts (
  post_id SERIAL PRIMARY KEY,
  subject VARCHAR(1000)) NOT NULL,
  body TEXT
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  image_link VARCHAR(255) NOT NULL,
  description TEXT
);

DROP TABLE IF EXISTS users_to_posts CASCADE;
CREATE TABLE users_to_posts (
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES posts (user_id),
  FOREIGN KEY (post_id) REFERENCES reviews (post_id)
);

DROP TABLE IF EXISTS users_to_comments CASCADE;
CREATE TABLE users_to_comments (
  user_id INT NOT NULL,
  comment_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES posts (user_id),
  FOREIGN KEY (post_id) REFERENCES reviews (post_id)
);