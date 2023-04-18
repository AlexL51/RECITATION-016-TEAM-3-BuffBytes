-- Use '' to escape apostraphes in strings.

insert into users (user_id, username, profile_image, password, description) values (1, 'collisteru', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', 'testPass', 'this person prefers to maintain an air of mystery about them.');
insert into users (user_id, username, profile_image, password, description) values (2, 'bank', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', 'testPass', 'a description of bank');
insert into users (user_id, username, profile_image, password, description) values (3, 'dijkstra','https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', 'testPass', 'a description of dijstra');
insert into users (user_id, username, profile_image, password, description) values (4, 'lovelace', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', 'testPass', 'a description of lovelace');
insert into users (user_id, username, profile_image, password, description) values (5, 'allen', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', 'testPass', 'a description of allen');

insert into topics (post_id, user_id, subject, body) values (1, 3, 'Test Post', 'What will be on the test?');
insert into topics (post_id, user_id, subject, body) values (2, 5, 'Other Post', 'Nothing is complete without a second example.');


insert into comments (comment_id, user_id, post_id, chain, body) values (1, 5, 1, '\', 'I''m pretty sure SQL will be on there.');
insert into comments (comment_id, user_id, post_id, chain, body) values (2, 2, 1, '\1', 'no nested sql commands pls');
insert into comments (comment_id, user_id, post_id, chain, body) values (3, 3, 1, '\1\2', 'They are not as difficult as they appear, as long as you...');
insert into comments (comment_id, user_id, post_id, chain, body) values (4, 4, 1, '\1', 'That''s not too bad');