/**
 * @name Hotel Room Booking System — Sample Data Seed Script
 * @description Seeds the PostgreSQL database with default users and sample rooms.
 *
 * Usage:
 *   cd backend
 *   node src/scripts/seed-sample-data.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sample data...\n');

  // ─── 0. Clear ALL existing data (reverse dependency order) ─
  console.log('🗑  Clearing existing data...');
  await prisma.reviews.deleteMany();
  await prisma.bookings.deleteMany();
  await prisma.roomImages.deleteMany();
  await prisma.rooms.deleteMany();
  await prisma.users.deleteMany();
  console.log('✓ All existing data cleared\n');

  // ─── 1. Create Admin User ──────────────────────────────
  const adminPassword = await bcrypt.hash('Prince123', 10);
  const adminUser = await prisma.users.create({
    data: {
      id: uuidv4(),
      userName: 'prabhjot',
      fullName: 'Prabhjot Saini',
      email: 'Prabhjot@gmail.com',
      phone: '123456789',
      password: adminPassword,
      avatar: '/avatar.png',
      gender: 'male',
      dob: new Date('2005-12-26'),
      address: 'Beach Resort Admin Office',
      role: 'admin',
      verified: true,
      status: 'login'
    }
  });
  console.log('✓ Admin user created');
  console.log('  Email:    Prabhjot@gmail.com');
  console.log('  Password: Prince123\n');

  // ─── 2. Create Regular User ────────────────────────────
  const userPassword = await bcrypt.hash('Vansh123', 10);
  await prisma.users.create({
    data: {
      id: uuidv4(),
      userName: 'vansh',
      fullName: 'Vansh',
      email: 'Vansh@gmail.com',
      phone: '1234567890',
      password: userPassword,
      avatar: '/avatar.png',
      gender: 'male',
      dob: new Date('2005-12-15'),
      address: 'Beach Resort Guest',
      role: 'user',
      verified: true,
      status: 'login'
    }
  });
  console.log('✓ Regular user created');
  console.log('  Email:    Vansh@gmail.com');
  console.log('  Password: Vansh123\n');

  // ─── 3. Create Sample Rooms ────────────────────────────
  const sampleRooms = [
    {
      room_name: 'Deluxe Ocean Suite',
      room_slug: 'deluxe-ocean-suite',
      room_type: 'couple',
      room_price: 15000,
      room_size: 500,
      room_capacity: 2,
      allow_pets: false,
      provide_breakfast: true,
      featured_room: true,
      room_description: 'Experience luxury at its finest in our Deluxe Ocean Suite. Wake up to breathtaking panoramic views of the ocean, enjoy a spacious living area, and relax in a premium king-size bed. Includes complimentary breakfast and access to our exclusive spa.',
      extra_facilities: ['Wi-Fi', 'Mini Bar', 'Ocean View', 'Room Service', 'Spa Access'],
      room_status: 'available'
    },
    {
      room_name: 'Presidential Villa',
      room_slug: 'presidential-villa',
      room_type: 'presidential',
      room_price: 35000,
      room_size: 1200,
      room_capacity: 4,
      allow_pets: true,
      provide_breakfast: true,
      featured_room: true,
      room_description: 'The ultimate luxury experience. Our Presidential Villa features a private pool, a personal butler service, two bedrooms, a gourmet kitchen, and an expansive terrace overlooking the crystal-clear waters. Perfect for those who demand nothing but the best.',
      extra_facilities: ['Private Pool', 'Butler Service', 'Kitchen', 'Wi-Fi', 'Terrace', 'Jacuzzi'],
      room_status: 'available'
    },
    {
      room_name: 'Family Beach House',
      room_slug: 'family-beach-house',
      room_type: 'family',
      room_price: 25000,
      room_size: 800,
      room_capacity: 6,
      allow_pets: true,
      provide_breakfast: true,
      featured_room: true,
      room_description: 'Spacious and fun for the whole family! Our Family Beach House offers three bedrooms, a fully equipped kitchen, a large living area, and direct beach access. Kids will love the game room, and parents will appreciate the peaceful reading nook.',
      extra_facilities: ['Beach Access', 'Game Room', 'Kitchen', 'Wi-Fi', 'BBQ Grill', 'Laundry'],
      room_status: 'available'
    },
    {
      room_name: 'Cozy Single Retreat',
      room_slug: 'cozy-single-retreat',
      room_type: 'single',
      room_price: 8000,
      room_size: 300,
      room_capacity: 1,
      allow_pets: false,
      provide_breakfast: true,
      featured_room: true,
      room_description: 'A perfect solo getaway. This cozy retreat features a comfortable queen-size bed, a work desk for digital nomads, a private balcony with garden views, and complimentary breakfast. Ideal for business travelers or solo adventurers.',
      extra_facilities: ['Wi-Fi', 'Work Desk', 'Balcony', 'Coffee Maker', 'Room Service'],
      room_status: 'available'
    },
    {
      room_name: 'Sunset Couple Suite',
      room_slug: 'sunset-couple-suite',
      room_type: 'couple',
      room_price: 18000,
      room_size: 550,
      room_capacity: 2,
      allow_pets: false,
      provide_breakfast: true,
      featured_room: false,
      room_description: 'Romance awaits in our Sunset Couple Suite. Enjoy a private hot tub, a four-poster king bed, and a balcony perfectly positioned for watching the sunset over the ocean. Includes champagne on arrival and couples spa treatment.',
      extra_facilities: ['Hot Tub', 'Wi-Fi', 'Champagne', 'Spa Treatment', 'Sunset Balcony'],
      room_status: 'available'
    },
    {
      room_name: 'Garden View Standard',
      room_slug: 'garden-view-standard',
      room_type: 'single',
      room_price: 5000,
      room_size: 250,
      room_capacity: 2,
      allow_pets: false,
      provide_breakfast: false,
      featured_room: false,
      room_description: 'Comfortable and affordable, our Garden View Standard room offers a peaceful retreat surrounded by lush tropical gardens. Features a comfortable double bed, en-suite bathroom, and a small private patio.',
      extra_facilities: ['Wi-Fi', 'Garden View', 'Patio', 'Air Conditioning'],
      room_status: 'available'
    },
    {
      room_name: 'Luxury King Suite',
      room_slug: 'luxury-king-suite',
      room_type: 'couple',
      room_price: 22000,
      room_size: 600,
      room_capacity: 2,
      allow_pets: false,
      provide_breakfast: true,
      featured_room: true,
      room_description: 'An expansive king suite offering unparalleled comfort with stunning city views. Features a marble bathroom with a deep soaking tub and exclusive lounge access.',
      extra_facilities: ['Wi-Fi', 'Lounge Access', 'City View', 'Bathtub'],
      room_status: 'available'
    },
    {
      room_name: 'Executive Family Room',
      room_slug: 'executive-family-room',
      room_type: 'family',
      room_price: 30000,
      room_size: 900,
      room_capacity: 5,
      allow_pets: true,
      provide_breakfast: true,
      featured_room: true,
      room_description: 'Perfect for large families, this executive room includes two interconnected spaces, kid-friendly amenities, and a massive 75-inch smart TV for entertainment.',
      extra_facilities: ['Wi-Fi', 'Interconnected Rooms', 'Smart TV', 'Kids Amenities'],
      room_status: 'available'
    },
    {
      room_name: 'Premium Single Room',
      room_slug: 'premium-single-room',
      room_type: 'single',
      room_price: 12000,
      room_size: 400,
      room_capacity: 1,
      allow_pets: false,
      provide_breakfast: true,
      featured_room: false,
      room_description: 'A quiet, refined space designed for the traveling executive. Features an ergonomic workspace, high-speed internet, and a premium espresso machine.',
      extra_facilities: ['Wi-Fi', 'Workspace', 'Espresso Machine', 'Air Conditioning'],
      room_status: 'available'
    },
    {
      room_name: 'Royal Presidential Suite',
      room_slug: 'royal-presidential-suite',
      room_type: 'presidential',
      room_price: 45000,
      room_size: 1500,
      room_capacity: 4,
      allow_pets: true,
      provide_breakfast: true,
      featured_room: true,
      room_description: 'The epitome of grandeur. The Royal Presidential Suite spans 1500 sq ft, featuring a private dining area, a personal gym, and a dedicated 24-hour concierge service.',
      extra_facilities: ['Private Gym', 'Dining Area', 'Concierge', 'Wi-Fi', 'Jacuzzi'],
      room_status: 'available'
    }
  ];

  for (let i = 0; i < sampleRooms.length; i++) {
    const room = sampleRooms[i];
    await prisma.rooms.create({
      data: {
        id: uuidv4(),
        ...room,
        created_by_id: adminUser.id,
        room_images: {
          create: [
            { id: uuidv4(), url: `/uploads/rooms/room-${i + 1}.jpeg` }
          ]
        }
      }
    });
  }

  console.log(`✓ Created ${sampleRooms.length} sample rooms (${sampleRooms.filter(r => r.featured_room).length} featured)\n`);

  // ─── 4. Create Dummy Users and Reviews ──────────────────────────────
  const newUsers = [
    { name: 'Shruti', email: 'Shruti@gmail.com', gender: 'female' },
    { name: 'Kumkum', email: 'Kumkum@gmail.com', gender: 'female' },
    { name: 'Supriya', email: 'Supriya@gmail.com', gender: 'female' },
    { name: 'Aftab', email: 'Aftab@gmail.com', gender: 'male' }
  ];

  const commonPassword = await bcrypt.hash('user123', 10);
  const createdDummyUsers = [];

  for (let i = 0; i < newUsers.length; i++) {
    const u = newUsers[i];
    const dUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        userName: u.name.toLowerCase(),
        fullName: u.name,
        email: u.email,
        phone: '100000000' + i,
        password: commonPassword,
        avatar: '/avatar.png',
        gender: u.gender,
        dob: new Date('2000-01-01'),
        address: 'Beach Resort Guest',
        role: 'user',
        verified: true,
        status: 'login'
      }
    });
    createdDummyUsers.push(dUser);
  }

  const allRooms = await prisma.rooms.findMany();

  for (let i = 0; i < allRooms.length; i++) {
    const room = allRooms[i];
    const user = createdDummyUsers[i % createdDummyUsers.length];
    
    const booking = await prisma.bookings.create({
      data: {
        id: uuidv4(),
        room_id: room.id,
        booking_dates: [new Date(), new Date(Date.now() + 86400000)],
        booking_status: 'completed',
        booking_by_id: user.id
      }
    });

    await prisma.reviews.create({
      data: {
        id: uuidv4(),
        user_id: user.id,
        room_id: room.id,
        booking_id: booking.id,
        rating: 5,
        message: 'Amazing room and great service! Highly recommended.'
      }
    });
  }

  console.log(`✓ Created ${newUsers.length} dummy users, bookings, and reviews\n`);

  // ─── 4. Summary ────────────────────────────────────────
  const counts = {
    users: await prisma.users.count(),
    rooms: await prisma.rooms.count(),
    featuredRooms: await prisma.rooms.count({ where: { featured_room: true } }),
    roomImages: await prisma.roomImages.count(),
    bookings: await prisma.bookings.count(),
    reviews: await prisma.reviews.count()
  };

  console.log('═══════════════════════════════════════════');
  console.log('         DATABASE SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`  Users:          ${counts.users}`);
  console.log(`  Rooms:          ${counts.rooms}`);
  console.log(`  Featured Rooms: ${counts.featuredRooms}`);
  console.log(`  Room Images:    ${counts.roomImages}`);
  console.log(`  Bookings:       ${counts.bookings}`);
  console.log(`  Reviews:        ${counts.reviews}`);
  console.log('═══════════════════════════════════════════');
  console.log('\n🎉 Seeding complete! Default credentials:');
  console.log('  Admin:  Prabhjot@gmail.com / Prince123');
  console.log('  User:   Vansh@gmail.com / Vansh123');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
