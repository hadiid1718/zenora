import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

const categories = [
  {
    name: 'Web Development',
    description: 'Build modern websites and web applications',
    sortOrder: 1,
  },
  {
    name: 'Mobile Development',
    description: 'Create iOS and Android applications',
    sortOrder: 2,
  },
  {
    name: 'Data Science',
    description: 'Analyze data and build ML models',
    sortOrder: 3,
  },
  {
    name: 'Programming Languages',
    description: 'Master programming languages from scratch',
    sortOrder: 4,
  },
  {
    name: 'Cloud Computing',
    description: 'AWS, Azure, GCP and cloud architecture',
    sortOrder: 5,
  },
  {
    name: 'DevOps',
    description: 'CI/CD, Docker, Kubernetes and automation',
    sortOrder: 6,
  },
  {
    name: 'Cybersecurity',
    description: 'Protect systems and networks from threats',
    sortOrder: 7,
  },
  {
    name: 'Database',
    description: 'SQL, NoSQL and database management',
    sortOrder: 8,
  },
  {
    name: 'UI/UX Design',
    description: 'Design beautiful user interfaces and experiences',
    sortOrder: 9,
  },
  {
    name: 'Digital Marketing',
    description: 'SEO, social media, and online marketing',
    sortOrder: 10,
  },
  {
    name: 'Business',
    description: 'Entrepreneurship, management and strategy',
    sortOrder: 11,
  },
  {
    name: 'Game Development',
    description: 'Build games with Unity, Unreal and more',
    sortOrder: 12,
  },
];

const slugify = str =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Category.countDocuments();
    if (existing > 0) {
      console.log(`${existing} categories already exist. Skipping seed.`);
      process.exit(0);
    }

    const docs = categories.map(c => ({
      ...c,
      slug: slugify(c.name),
      isActive: true,
    }));
    await Category.insertMany(docs);
    console.log(`Seeded ${docs.length} categories successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
