-- Use '' to escape apostraphes in strings.

-- Unhashed password: colliPass
insert into users (user_id, username, profile_image, password, description) values (1, 'collisteru', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$G1OuLyLCCr8rAL5Hw1w/nuiF3dtpjgIi.J0egQwknpCSDRr/bCGpe', 'A description of Collisteru');

-- Unhashed password: bankPass
insert into users (user_id, username, profile_image, password, description) values (2, 'bank', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$9tXT6/hXOOry6dCsdVu8Ju3NXp0tWirnasSvP7o66gFfwe8rLVpK2', 'a description of bank');

-- Unhashed password: dijkstraPass
insert into users (user_id, username, profile_image, password, description) values (3, 'dijkstra','https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$4GhtDPsSyU1Nx80S.K8JS.7di3ypSdRz/ao9zKJqnyia3pT3p0hjm', 'a description of dijkstra');

-- Unhashed password: lovelacePass
insert into users (user_id, username, profile_image, password, description) values (4, 'lovelace', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$.JCoRSbRO5zGicQ5atRmPOLt0aiskI1RPMdBuwUZAgk7M5Nl1TNcK', 'a description of lovelace');

-- Unhashed password: allenPass
insert into users (user_id, username, profile_image, password, description) values (5, 'allen', 'https://www.dlf.pt/dfpng/maxpng/276-2761324_default-avatar-png.png', '$2b$10$U4y8Ta6yJxM5JEvvQsouhu6.XR/jkJ0ZKmVI8UMkt6Shf.hJag80e', 'a description of allen');


-- VERY IMPORTANT LINE: This resets the next serial in the users table to the actual next number in the sequence, since they are misaligned by default due to the bulk insert.
select setval(pg_get_serial_sequence('users', 'user_id'), (select max(user_id) from users)+1);


-- The 'map' boolean is 'true' when the post contains a map and 'false' when it doesn't. A post can contain at most one map. 'map_long' and 'map_lat' determine the coordinates for the map and are decimal values.
-- At least five digits after the zero should be stored to ensure precision to within a single square meter of accuracy.
-- 'map_long' and 'map_lat' are zero when 'map' is 'false'.
insert into topics (post_id, user_id, subject, body, map, map_long, map_lat, map_zoom) values (1, 3, 'Test Post', 'What will be on the test?', false, 0, 0, 0);
insert into topics (post_id, user_id, subject, body, map, map_long, map_lat, map_zoom) values (2, 5, 'Other Post', 'Nothing is complete without a second example', false, 0, 0, 0);
insert into topics (post_id, user_id, subject, body, map, map_long, map_lat, map_zoom) values (3, 3, 'A Long Post', 'This is a test for a longer post, and to see how multiple posts look on the profile page', false, 0, 0, 0); 
insert into topics (post_id, user_id, subject, body, map, map_long, map_lat, map_zoom) values (4, 3, 'Shortest Path?', 'How do I find the shortest path between nodes in a weighted graph?', false, 0, 0, 0); 
insert into topics (post_id, user_id, subject, body, map, map_long, map_lat, map_zoom) values (5, 3, 'Testing the Map', 'Meet you in the engineering building! ', true, 40.00657, -105.26370, 8); 
insert into topics (post_id, user_id, subject, body, map, map_long, map_lat, map_zoom) values (6, 3, 'Testing the Map: Part Two', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Bibendum ut tristique et egestas quis ipsum suspendisse. Ut placerat orci nulla pellentesque dignissim enim sit. In arcu cursus euismod quis viverra nibh cras pulvinar mattis. Enim praesent elementum facilisis leo vel fringilla est ullamcorper. Eleifend mi in nulla posuere sollicitudin aliquam. Turpis cursus in hac habitasse platea dictumst. Lacus suspendisse faucibus interdum posuere. Nullam ac tortor vitae purus. Libero nunc consequat interdum varius sit. Vulputate sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum. Semper quis lectus nulla at volutpat diam ut venenatis.

Hendrerit dolor magna eget est lorem ipsum. Elementum tempus egestas sed sed risus pretium quam. Dictum fusce ut placerat orci nulla pellentesque. Pharetra massa massa ultricies mi quis hendrerit dolor magna. Ut eu sem integer vitae justo. Sodales ut etiam sit amet nisl purus in. Sapien pellentesque habitant morbi tristique senectus et netus et. Est ante in nibh mauris cursus mattis molestie a iaculis. Elementum nisi quis eleifend quam. Consectetur adipiscing elit duis tristique sollicitudin nibh sit. Purus sit amet luctus venenatis lectus.', true, 51.48205, -0.00524, 6); 



select setval(pg_get_serial_sequence('topics', 'post_id'), (select max(post_id) from topics)+1);


-- The parent value is the comment_id of this comment's parent. A value of zero indicates that this comment has no parent and should not appear as a reply to any other comment.
insert into comments (comment_id, user_id, post_id, chain, body) values (1, 5, 1, 0, 'I''m pretty sure SQL will be on there.');
insert into comments (comment_id, user_id, post_id, chain, body) values (2, 2, 1, 1, 'no nested sql commands pls');
insert into comments (comment_id, user_id, post_id, chain, body) values (3, 3, 1, 2, 'They are not as difficult as they appear, as long as you...');
insert into comments (comment_id, user_id, post_id, chain, body) values (4, 4, 1, 1, 'That''s not too bad');
insert into comments (comment_id, user_id, post_id, chain, body) values (5, 2, 1, 3, 'i still dont want any');

select setval(pg_get_serial_sequence('comments', 'comment_id'), (select max(comment_id) from comments)+1);
