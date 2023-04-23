-- Use '' to escape apostraphes in strings.

-- Unhashed password: colliPass
insert into users (user_id, username, profile_image, password, description) values (1, 'collisteru', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$G1OuLyLCCr8rAL5Hw1w/nuiF3dtpjgIi.J0egQwknpCSDRr/bCGpe', 'this person prefers to maintain an air of mystery about them.');

-- Unhashed password: bankPass
insert into users (user_id, username, profile_image, password, description) values (2, 'bank', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$9tXT6/hXOOry6dCsdVu8Ju3NXp0tWirnasSvP7o66gFfwe8rLVpK2', 'a description of bank');

-- Unhashed password: dijkstraPass
insert into users (user_id, username, profile_image, password, description) values (3, 'dijkstra','https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$4GhtDPsSyU1Nx80S.K8JS.7di3ypSdRz/ao9zKJqnyia3pT3p0hjm', 'a description of dijkstra');

-- Unhashed password: lovelacePass
insert into users (user_id, username, profile_image, password, description) values (4, 'lovelace', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$.JCoRSbRO5zGicQ5atRmPOLt0aiskI1RPMdBuwUZAgk7M5Nl1TNcK', 'a description of lovelace');

-- Unhashed password: allenPass
insert into users (user_id, username, profile_image, password, description) values (5, 'allen', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$U4y8Ta6yJxM5JEvvQsouhu6.XR/jkJ0ZKmVI8UMkt6Shf.hJag80e', 'a description of allen');



-- VERY IMPORTANT LINE: This resets the next serial in the users table to the actual next number in the sequence, since they are misaligned by default due to the bulk insert.
-- (Weird bug)
select setval(pg_get_serial_sequence('users', 'user_id'), (select max(user_id) from users)+1);

insert into topics (post_id, user_id, subject, body) values (1, 3, 'Test Post', 'What will be on the test?');
insert into topics (post_id, user_id, subject, body) values (2, 5, 'Other Post', 'Nothing is complete without a second example.');

select setval(pg_get_serial_sequence('topics', 'post_id'), (select max(post_id) from topics)+1);


-- The chain value shows the "heritage," or chain of parents, of a certain comment. A top-level comment has a chain of '\'. A comment that replies to the comment with a comment_id of 
-- 1 will have a chain of '/1'. If that comment has a comment id of 2.
insert into comments (comment_id, user_id, post_id, chain, body) values (1, 5, 1, '\', 'I''m pretty sure SQL will be on there.');
insert into comments (comment_id, user_id, post_id, chain, body) values (2, 2, 1, '\1', 'no nested sql commands pls');
insert into comments (comment_id, user_id, post_id, chain, body) values (3, 3, 1, '\1\2', 'They are not as difficult as they appear, as long as you...');
insert into comments (comment_id, user_id, post_id, chain, body) values (4, 4, 1, '\1', 'That''s not too bad');

select setval(pg_get_serial_sequence('comments', 'comment_id'), (select max(comment_id) from comments)+1);
