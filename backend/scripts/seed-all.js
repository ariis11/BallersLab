const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAll() {
  try {
    console.log('🌱 Starting complete database seeding...');

    // Check if we have users
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('⚠️  No users found. Please run user seeding first:');
      console.log('   npm run db:seed');
      return;
    }

    console.log(`✅ Found ${userCount} users in database`);

    // Run tournament seeding
    console.log('🏀 Seeding tournaments...');
    
    const sampleTournaments = [
      {
        title: 'Downtown Basketball Championship',
        description: 'Join us for an exciting 1x1 basketball tournament in the heart of downtown! All skill levels welcome.',
        locationName: 'Downtown Basketball Court',
        latitude: 40.7128,
        longitude: -74.0060,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        skillLevel: 'ALL_LEVELS',
        maxPlayers: 16,
        status: 'REGISTRATION_OPEN',
        isPublic: true,
        registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 6 days from now
      },
      {
        title: 'Pro-Am Basketball Showdown',
        description: 'High-level competition for advanced and professional players. Serious players only.',
        locationName: 'Pro Basketball Arena',
        latitude: 40.7589,
        longitude: -73.9851,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        skillLevel: 'ADVANCED',
        maxPlayers: 8,
        status: 'REGISTRATION_OPEN',
        isPublic: true,
        registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) // 12 days from now
      },
      {
        title: 'Beginner Friendly Tournament',
        description: 'Perfect for new players! Learn the game and have fun in a supportive environment.',
        locationName: 'Community Recreation Center',
        latitude: 40.7505,
        longitude: -73.9934,
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        skillLevel: 'BEGINNER',
        maxPlayers: 32,
        status: 'REGISTRATION_OPEN',
        isPublic: true,
        registrationDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000) // 9 days from now
      },
      {
        title: 'Weekend Warriors Tournament',
        description: 'Casual weekend tournament for intermediate players. Great way to stay active!',
        locationName: 'Weekend Sports Complex',
        latitude: 40.7549,
        longitude: -73.9840,
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        skillLevel: 'INTERMEDIATE',
        maxPlayers: 24,
        status: 'REGISTRATION_OPEN',
        isPublic: true,
        registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    ];

    // Get the first user to use as creator
    const firstUser = await prisma.user.findFirst();

    // Create tournaments
    for (const tournamentData of sampleTournaments) {
      const tournament = await prisma.tournament.create({
        data: {
          ...tournamentData,
          createdBy: firstUser.id
        }
      });
      console.log(`✅ Created tournament: ${tournament.title}`);
    }

    console.log('🎉 Complete seeding finished successfully!');
    console.log('📊 Database now contains:');
    console.log(`   - ${await prisma.user.count()} users`);
    console.log(`   - ${await prisma.tournament.count()} tournaments`);
    console.log(`   - ${await prisma.tournamentParticipant.count()} tournament participants`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAll(); 