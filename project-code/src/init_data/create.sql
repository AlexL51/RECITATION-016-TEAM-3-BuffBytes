-- Using path enumeration to store recursive comment threads in SQL. See slide 55 of this slidedeck:
-- https://www.slideshare.net/billkarwin/sql-antipatterns-strike-back?src=embeds
-- TEXT Supports truly infinite depth

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  profile_image VARCHAR(255) NOT NULL,
  password VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE topics (
  post_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(1000) NOT NULL,
  body TEXT,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  chain TEXT,
  body TEXT,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- Tables users_to_comments and users_to_topics may be useful if we ever want to 
-- display all of the topics / comments from a certain user.