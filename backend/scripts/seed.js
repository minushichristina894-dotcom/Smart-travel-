/**
 * Seed script - University project demo data (Sri Lanka)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const images = require('../data/sriLankaImages');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('📦 Resetting database...');
    await connection.query('DROP DATABASE IF EXISTS smart_travel_planner');
    const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    await connection.query(schema);

    console.log('🌱 Seeding data...');
    const hash = async (pw) => bcrypt.hash(pw, 12);

    // Admin
    await connection.query(
      'INSERT INTO admins (full_name, username, email, password) VALUES (?,?,?,?)',
      ['System Admin', 'admin', 'admin@smarttravel.lk', await hash('admin123')]
    );

    // Staff
    await connection.query(
      'INSERT INTO staff (full_name, username, email, password, phone, department) VALUES (?,?,?,?,?,?)',
      ['Kasun Silva', 'staff01', 'staff@smarttravel.lk', await hash('staff123'), '+94771234567', 'Customer Support']
    );

    // Customer (email pre-verified for demo login)
    await connection.query(
      `INSERT INTO users (full_name, username, email, password, phone, email_verified, email_verified_at)
       VALUES (?,?,?,?,?,TRUE,NOW())`,
      ['Nimal Perera', 'nimal', 'nimal@example.lk', await hash('user123'), '+94771112233']
    );

    const destinations = [
      { name: 'Sigiriya', description: 'Ancient Lion Rock fortress — UNESCO World Heritage Site in the cultural triangle.', image_url: images.sigiriya.main, gallery: images.sigiriya.gallery, price: 12000, lat: 7.957, lon: 80.760 },
      { name: 'Kandy', description: 'Cultural capital with the sacred Temple of the Tooth Relic and misty hill scenery.', image_url: images.kandy.main, gallery: images.kandy.gallery, price: 10000, lat: 7.291, lon: 80.634 },
      { name: 'Galle', description: 'Historic Dutch Fort on the southern coast — cobblestone streets and ocean views.', image_url: images.galle.main, gallery: images.galle.gallery, price: 11000, lat: 6.054, lon: 80.221 },
      { name: 'Ella', description: 'Hill country paradise with Nine Arch Bridge, tea estates, and hiking trails.', image_url: images.ella.main, gallery: images.ella.gallery, price: 9000, lat: 6.867, lon: 81.047 },
      { name: 'Mirissa', description: 'South coast beach town famous for whale watching and golden sunsets.', image_url: images.mirissa.main, gallery: images.mirissa.gallery, price: 13000, lat: 5.948, lon: 80.472 },
      { name: 'Nuwara Eliya', description: 'Little England — cool climate, tea plantations, and colonial charm.', image_url: images.nuwaraEliya.main, gallery: images.nuwaraEliya.gallery, price: 10500, lat: 6.950, lon: 80.789 },
    ];

    for (const d of destinations) {
      await connection.query(
        'INSERT INTO destinations (name, country, description, image_url, gallery, price, latitude, longitude) VALUES (?,?,?,?,?,?,?,?)',
        [d.name, 'Sri Lanka', d.description, d.image_url, JSON.stringify(d.gallery), d.price, d.lat, d.lon]
      );
    }

    const activities = [
      { dest: 1, name: 'Rock Fortress Climb', desc: 'Guided climb to the summit of Sigiriya', price: 1500, hours: 4, image: images.sigiriya.gallery[0], age: 'Adults' },
      { dest: 1, name: 'Village Safari', desc: 'Bullock cart and lake tour', price: 1200, hours: 3, image: images.sigiriya.gallery[1], age: 'All Ages' },
      { dest: 2, name: 'Temple of the Tooth Visit', desc: 'Sacred Buddhist temple tour', price: 800, hours: 2, image: images.kandy.gallery[0], age: 'All Ages' },
      { dest: 2, name: 'Kandyan Dance Show', desc: 'Traditional cultural performance', price: 1000, hours: 2, image: images.kandy.gallery[1], age: 'Kids' },
      { dest: 3, name: 'Galle Fort Walking Tour', desc: 'Explore Dutch colonial architecture', price: 600, hours: 2, image: images.galle.gallery[0], age: 'All Ages' },
      { dest: 4, name: 'Nine Arch Bridge Hike', desc: 'Scenic hike to the iconic railway bridge', price: 500, hours: 3, image: images.ella.gallery[0], age: 'Adults' },
      { dest: 4, name: 'Tea Factory Tour', desc: 'Learn Ceylon tea production', price: 800, hours: 2, image: images.ella.gallery[1], age: 'Kids' },
      { dest: 5, name: 'Whale Watching', desc: 'Boat trip to spot blue whales', price: 3500, hours: 4, image: images.mirissa.gallery[0], age: 'Kids' },
      { dest: 5, name: 'Snorkeling', desc: 'Explore coral reefs', price: 2000, hours: 3, image: images.mirissa.gallery[1], age: 'Adults' },
      { dest: 6, name: 'Tea Plantation Walk', desc: 'Walk through lush green estates', price: 600, hours: 2, image: images.nuwaraEliya.gallery[0], age: 'All Ages' },
    ];

    for (const a of activities) {
      await connection.query(
        'INSERT INTO activities (destination_id, name, description, price, duration_hours, image_url, age_category) VALUES (?,?,?,?,?,?,?)',
        [a.dest, a.name, a.desc, a.price, a.hours, a.image, a.age]
      );
    }

    await connection.query(
      `INSERT INTO bookings (user_id, destination_id, activity_id, travelers, travel_date, total_price, risk_level, status, payment_status, payment_method, transaction_id, paid_at)
       VALUES (1, 4, 6, 2, DATE_ADD(CURDATE(), INTERVAL 14 DAY), 19000, 'safe', 'confirmed', 'paid', 'card', 'STP-DEMO-001', NOW())`
    );

    // Pending bookings for staff to confirm (demo)
    await connection.query(
      `INSERT INTO bookings (user_id, destination_id, activity_id, travelers, travel_date, total_price, risk_level, status, payment_status)
       VALUES
       (1, 1, 1, 2, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 27000, 'moderate', 'pending', 'paid'),
       (1, 3, 5, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 11600, 'safe', 'pending', 'unpaid')`
    );

    // Weather log for staff alerts page (demo)
    await connection.query(
      `INSERT INTO weather_logs (user_id, destination_id, activity_id, travel_date, temperature, rain_mm, wind_speed_kmh, humidity, risk_level, recommendation)
       VALUES (1, 1, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 27, 12, 22, 78, 'moderate',
       'Light rain expected — carry rain gear and plan flexible activities.')`
    );

    await connection.query(
      `INSERT INTO system_settings (setting_key, setting_value) VALUES
       ('site_name', 'Smart Travel Planning System'),
       ('currency', 'LKR'),
       ('weather_api', 'OpenWeatherMap API')`
    );

    console.log('✅ Seed complete!\n');
    console.log('Admin:  admin / admin123');
    console.log('Staff:  staff01 / staff123');
    console.log('User:   nimal / user123');
  } catch (e) {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
