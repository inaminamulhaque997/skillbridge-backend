import { PrismaClient, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('Cleaning existing data...');
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.tutorProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('Existing data cleaned');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@skillbridge.com',
      password: hashedPassword,
      name: 'Platform Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Admin created:', admin.email);

  // Create categories
  const categories = [
    { name: 'Mathematics', description: 'Math tutoring for all levels including Algebra, Calculus, Statistics', icon: '📐' },
    { name: 'Science', description: 'Physics, Chemistry, Biology tutoring', icon: '🔬' },
    { name: 'Programming', description: 'Computer science, web development, mobile apps', icon: '💻' },
    { name: 'Languages', description: 'English, Spanish, French, German and more', icon: '🌍' },
    { name: 'Music', description: 'Piano, Guitar, Voice, Violin lessons', icon: '🎵' },
    { name: 'Art & Design', description: 'Drawing, Painting, Digital Art, UI/UX', icon: '🎨' },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category,
    });
    createdCategories.push(created);
  }
  console.log('Categories created:', createdCategories.length);

  // Create sample tutors with enhanced profiles
  const tutorData = [
    {
      email: 'john.tutor@skillbridge.com',
      name: 'John Smith',
      password: 'password123',
      bio: 'Experienced math tutor with 5 years of teaching experience. I specialize in making complex concepts simple and understandable.',
      hourlyRate: 50,
      education: 'MSc in Mathematics from MIT',
      experience: '5 years teaching at university level',
      subjects: ['Mathematics', 'Calculus', 'Statistics', 'Algebra'],
      languages: ['English', 'Spanish'],
    },
    {
      email: 'sarah.tutor@skillbridge.com',
      name: 'Sarah Johnson',
      password: 'password123',
      bio: 'Passionate programming tutor specializing in web development. I love helping students build real-world projects.',
      hourlyRate: 60,
      education: 'BSc in Computer Science from Stanford',
      experience: '3 years in industry + 2 years tutoring',
      subjects: ['Programming', 'JavaScript', 'React', 'Node.js', 'Python'],
      languages: ['English'],
    },
    {
      email: 'mike.tutor@skillbridge.com',
      name: 'Mike Wilson',
      password: 'password123',
      bio: 'Physics teacher with research background. I make physics fun and relatable with real-world examples.',
      hourlyRate: 45,
      education: 'PhD in Physics from Cambridge',
      experience: '10 years teaching + 5 years research',
      subjects: ['Science', 'Physics', 'Chemistry'],
      languages: ['English', 'French'],
    },
    {
      email: 'emma.tutor@skillbridge.com',
      name: 'Emma Davis',
      password: 'password123',
      bio: 'Language enthusiast and certified teacher. I help students become confident speakers.',
      hourlyRate: 40,
      education: 'MA in Linguistics',
      experience: '7 years teaching languages',
      subjects: ['Languages', 'English', 'Spanish', 'French'],
      languages: ['English', 'Spanish', 'French', 'German'],
    },
    {
      email: 'david.tutor@skillbridge.com',
      name: 'David Chen',
      password: 'password123',
      bio: 'Professional musician and teacher. From beginners to advanced, I tailor lessons to your goals.',
      hourlyRate: 55,
      education: 'Berklee College of Music',
      experience: '15 years performing + 10 years teaching',
      subjects: ['Music', 'Piano', 'Guitar', 'Music Theory'],
      languages: ['English', 'Mandarin'],
    },
    {
      email: 'lisa.tutor@skillbridge.com',
      name: 'Lisa Anderson',
      password: 'password123',
      bio: 'Professional artist and designer. I teach both traditional and digital art techniques.',
      hourlyRate: 50,
      education: 'MFA in Fine Arts',
      experience: '8 years as professional artist',
      subjects: ['Art & Design', 'Drawing', 'Painting', 'Digital Art'],
      languages: ['English'],
    },
  ];

  const createdTutors = [];
  for (const data of tutorData) {
    const tutorUser = await prisma.user.create({
      data: {
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        name: data.name,
        role: 'TUTOR',
        isActive: true,
        tutorProfile: {
          create: {
            bio: data.bio,
            hourlyRate: data.hourlyRate,
            education: data.education,
            experience: data.experience,
            subjects: data.subjects,
            languages: data.languages,
          },
        },
      },
      include: {
        tutorProfile: true,
      },
    });
    createdTutors.push(tutorUser);
    console.log('Tutor created:', tutorUser.email);

    // Create availability for tutor (Monday-Friday, various times)
    const availabilitySlots = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }, // Monday morning
      { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' }, // Monday afternoon
      { dayOfWeek: 2, startTime: '10:00', endTime: '15:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' }, // Wednesday morning
      { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' }, // Wednesday afternoon
      { dayOfWeek: 4, startTime: '10:00', endTime: '16:00' }, // Thursday
      { dayOfWeek: 5, startTime: '09:00', endTime: '14:00' }, // Friday
    ];

    for (const slot of availabilitySlots) {
      await prisma.availability.create({
        data: {
          tutorId: tutorUser.id,
          ...slot,
          isActive: true,
        },
      });
    }
    console.log('Availability created for:', tutorUser.email);
  }

  // Create sample students
  const studentData = [
    { email: 'student@skillbridge.com', name: 'Alex Student', password: 'password123' },
    { email: 'maria.student@skillbridge.com', name: 'Maria Garcia', password: 'password123' },
    { email: 'james.student@skillbridge.com', name: 'James Brown', password: 'password123' },
  ];

  const createdStudents = [];
  for (const data of studentData) {
    const student = await prisma.user.create({
      data: {
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        name: data.name,
        role: 'STUDENT',
        isActive: true,
      },
    });
    createdStudents.push(student);
    console.log('Student created:', student.email);
  }

  // Create sample bookings
  const today = new Date();
  const bookings = [
    {
      studentId: createdStudents[0].id,
      tutorId: createdTutors[0].id,
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      startTime: '10:00',
      endTime: '11:00',
      status: BookingStatus.CONFIRMED,
      price: 50,
      notes: 'Need help with calculus derivatives',
    },
    {
      studentId: createdStudents[0].id,
      tutorId: createdTutors[1].id,
      date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      startTime: '14:00',
      endTime: '15:00',
      status: BookingStatus.PENDING,
      price: 60,
      notes: 'React hooks tutorial',
    },
    {
      studentId: createdStudents[1].id,
      tutorId: createdTutors[2].id,
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      startTime: '09:00',
      endTime: '10:00',
      status: BookingStatus.COMPLETED,
      price: 45,
      notes: 'Physics mechanics review',
    },
    {
      studentId: createdStudents[1].id,
      tutorId: createdTutors[3].id,
      date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      startTime: '15:00',
      endTime: '16:00',
      status: BookingStatus.CONFIRMED,
      price: 40,
      notes: 'Spanish conversation practice',
    },
    {
      studentId: createdStudents[2].id,
      tutorId: createdTutors[4].id,
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      startTime: '11:00',
      endTime: '12:00',
      status: BookingStatus.COMPLETED,
      price: 55,
      notes: 'Piano lesson - beginner',
    },
  ];

  for (const booking of bookings) {
    await prisma.booking.create({
      data: booking,
    });
  }
  console.log('Bookings created:', bookings.length);

  // Create sample reviews for completed bookings
  const reviews = [
    {
      bookingId: (await prisma.booking.findFirst({
        where: { studentId: createdStudents[1].id, tutorId: createdTutors[2].id, status: 'COMPLETED' }
      }))!.id,
      studentId: createdStudents[1].id,
      tutorId: createdTutors[2].id,
      rating: 5,
      comment: 'Excellent physics tutor! Made complex topics easy to understand.',
    },
    {
      bookingId: (await prisma.booking.findFirst({
        where: { studentId: createdStudents[2].id, tutorId: createdTutors[4].id, status: 'COMPLETED' }
      }))!.id,
      studentId: createdStudents[2].id,
      tutorId: createdTutors[4].id,
      rating: 4,
      comment: 'Great piano teacher, very patient with beginners.',
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }
  console.log('Reviews created:', reviews.length);

  console.log('\n========================================');
  console.log('Seed completed successfully!');
  console.log('========================================');
  console.log('\nTest Credentials:');
  console.log('------------------');
  console.log('Admin: admin@skillbridge.com / admin123');
  console.log('Tutors:');
  console.log('  - john.tutor@skillbridge.com / password123');
  console.log('  - sarah.tutor@skillbridge.com / password123');
  console.log('  - mike.tutor@skillbridge.com / password123');
  console.log('  - emma.tutor@skillbridge.com / password123');
  console.log('  - david.tutor@skillbridge.com / password123');
  console.log('  - lisa.tutor@skillbridge.com / password123');
  console.log('Students:');
  console.log('  - student@skillbridge.com / password123');
  console.log('  - maria.student@skillbridge.com / password123');
  console.log('  - james.student@skillbridge.com / password123');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
