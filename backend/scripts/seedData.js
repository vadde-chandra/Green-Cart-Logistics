const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

const User = require('../models/User');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greencart-logistics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Route.deleteMany({});
    await Order.deleteMany({});

    console.log('Cleared existing data');

    // Create default admin user
    const adminUser = new User({
      name: process.env.ADMIN_NAME || 'System Manager',
      email: process.env.ADMIN_EMAIL || 'manager@greencart.com',
      password: process.env.ADMIN_PASSWORD || 'password123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Created admin user');

    // Seed drivers from CSV
    const driversData = [];
    const driversPath = path.join(__dirname, '../data/drivers.csv');
    
    if (fs.existsSync(driversPath)) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(driversPath)
          .pipe(csv())
          .on('data', (row) => {
            const pastWeekHours = row.past_week_hours.split('|').map(h => parseInt(h));
            driversData.push({
              name: row.name,
              shift_hours: parseInt(row.shift_hours),
              past_week_hours: pastWeekHours
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });

      await Driver.insertMany(driversData);
      console.log(`Seeded ${driversData.length} drivers`);
    }

    // Seed routes (create sample routes since not in CSV)
    const routesData = [
      { route_id: 1, distance: 5.2, traffic_level: 'Low', base_time: 25 },
      { route_id: 2, distance: 3.8, traffic_level: 'Medium', base_time: 20 },
      { route_id: 3, distance: 7.1, traffic_level: 'High', base_time: 45 },
      { route_id: 4, distance: 4.5, traffic_level: 'Medium', base_time: 30 },
      { route_id: 5, distance: 6.3, traffic_level: 'Low', base_time: 35 },
      { route_id: 6, distance: 8.9, traffic_level: 'High', base_time: 55 },
      { route_id: 7, distance: 3.2, traffic_level: 'Low', base_time: 18 },
      { route_id: 8, distance: 5.7, traffic_level: 'Medium', base_time: 32 },
      { route_id: 9, distance: 4.1, traffic_level: 'Low', base_time: 22 },
      { route_id: 10, distance: 9.5, traffic_level: 'High', base_time: 60 }
    ];

    await Route.insertMany(routesData);
    console.log(`Seeded ${routesData.length} routes`);

    // Seed orders from CSV
    const ordersData = [];
    const ordersPath = path.join(__dirname, '../data/orders.csv');
    
    if (fs.existsSync(ordersPath)) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(ordersPath)
          .pipe(csv())
          .on('data', (row) => {
            ordersData.push({
              order_id: parseInt(row.order_id),
              value_rs: parseInt(row.value_rs),
              route_id: parseInt(row.route_id),
              delivery_time: row.delivery_time
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });

      await Order.insertMany(ordersData);
      console.log(`Seeded ${ordersData.length} orders`);
    }

    console.log('Data seeding completed successfully!');
    console.log('\nLogin credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'password123'}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();