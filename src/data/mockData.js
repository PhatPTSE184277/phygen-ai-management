// Mock data for demonstration
export const mockUsers = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20'
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'manager',
    status: 'active',
    createdAt: '2024-01-18',
    lastLogin: '2024-01-21'
  },
  {
    id: 3,
    username: 'bob_wilson',
    email: 'bob@example.com',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-01-10',
    lastLogin: '2024-01-19'
  },
  {
    id: 4,
    username: 'alice_brown',
    email: 'alice@example.com',
    role: 'manager',
    status: 'active',
    createdAt: '2024-01-12',
    lastLogin: '2024-01-22'
  },
  {
    id: 5,
    username: 'charlie_davis',
    email: 'charlie@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-20',
    lastLogin: '2024-01-22'
  }
];

export const mockExams = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Basic JavaScript concepts and syntax',
    category: 'Programming',
    duration: 60,
    questions: 25,
    difficulty: 'Beginner',
    status: 'published',
    createdAt: '2024-01-15',
    author: 'John Doe'
  },
  {
    id: 2,
    title: 'React Advanced Concepts',
    description: 'Advanced React patterns and hooks',
    category: 'Programming',
    duration: 90,
    questions: 35,
    difficulty: 'Advanced',
    status: 'draft',
    createdAt: '2024-01-18',
    author: 'Jane Smith'
  },
  {
    id: 3,
    title: 'Database Design',
    description: 'Relational database design principles',
    category: 'Database',
    duration: 120,
    questions: 40,
    difficulty: 'Intermediate',
    status: 'published',
    createdAt: '2024-01-10',
    author: 'Bob Wilson'
  },
  {
    id: 4,
    title: 'CSS Grid & Flexbox',
    description: 'Modern CSS layout techniques',
    category: 'Web Design',
    duration: 45,
    questions: 20,
    difficulty: 'Intermediate',
    status: 'published',
    createdAt: '2024-01-12',
    author: 'Alice Brown'
  },
  {
    id: 5,
    title: 'Node.js Backend Development',
    description: 'Server-side JavaScript with Node.js',
    category: 'Backend',
    duration: 100,
    questions: 30,
    difficulty: 'Advanced',
    status: 'draft',
    createdAt: '2024-01-20',
    author: 'Charlie Davis'
  }
];

export const mockCategories = [
  {
    id: 1,
    name: 'Programming',
    description: 'Programming languages and concepts',
    examCount: 15,
    color: '#3B82F6'
  },
  {
    id: 2,
    name: 'Database',
    description: 'Database design and management',
    examCount: 8,
    color: '#10B981'
  },
  {
    id: 3,
    name: 'Web Design',
    description: 'Frontend design and development',
    examCount: 12,
    color: '#F59E0B'
  },
  {
    id: 4,
    name: 'Backend',
    description: 'Server-side development',
    examCount: 10,
    color: '#EF4444'
  }
];