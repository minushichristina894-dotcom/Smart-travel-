-- Lower demo prices to realistic LKR per-person rates
USE smart_travel_planner;

UPDATE destinations SET price = 12000 WHERE name = 'Sigiriya';
UPDATE destinations SET price = 10000 WHERE name = 'Kandy';
UPDATE destinations SET price = 11000 WHERE name = 'Galle';
UPDATE destinations SET price = 9000 WHERE name = 'Ella';
UPDATE destinations SET price = 13000 WHERE name = 'Mirissa';
UPDATE destinations SET price = 10500 WHERE name = 'Nuwara Eliya';

UPDATE activities SET price = 1500 WHERE name = 'Rock Fortress Climb';
UPDATE activities SET price = 1200 WHERE name = 'Village Safari';
UPDATE activities SET price = 800 WHERE name = 'Temple of the Tooth Visit';
UPDATE activities SET price = 1000 WHERE name = 'Kandyan Dance Show';
UPDATE activities SET price = 600 WHERE name = 'Galle Fort Walking Tour';
UPDATE activities SET price = 500 WHERE name = 'Nine Arch Bridge Hike';
UPDATE activities SET price = 800 WHERE name = 'Tea Factory Tour';
UPDATE activities SET price = 3500 WHERE name = 'Whale Watching';
UPDATE activities SET price = 2000 WHERE name = 'Snorkeling';
UPDATE activities SET price = 600 WHERE name = 'Tea Plantation Walk';
