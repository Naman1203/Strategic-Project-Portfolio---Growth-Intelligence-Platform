const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

// Load models
const User = require('../models/User');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const Financial = require('../models/Financial');
const Prediction = require('../models/Prediction');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    department: 'Management'
  },
  {
    name: 'John Manager',
    email: 'john@example.com',
    password: 'password123',
    role: 'manager',
    department: 'Engineering'
  },
  {
    name: 'Jane User',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    department: 'Marketing'
  }
];

const employees = [
  {
    name: 'Alice Johnson',
    email: 'alice@company.com',
    department: 'Engineering',
    role: 'Senior Developer',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    salary: 120000,
    hireDate: new Date('2021-03-15'),
    availability: 'Available'
  },
  {
    name: 'Bob Smith',
    email: 'bob@company.com',
    department: 'Engineering',
    role: 'DevOps Engineer',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    salary: 115000,
    hireDate: new Date('2020-06-20'),
    availability: 'Busy'
  },
  {
    name: 'Carol Williams',
    email: 'carol@company.com',
    department: 'Marketing',
    role: 'Marketing Manager',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    salary: 95000,
    hireDate: new Date('2019-09-10'),
    availability: 'Available'
  },
  {
    name: 'David Brown',
    email: 'david@company.com',
    department: 'Finance',
    role: 'Financial Analyst',
    skills: ['Financial Analysis', 'Excel', 'Forecasting', 'Reporting'],
    salary: 85000,
    hireDate: new Date('2022-01-05'),
    availability: 'Available'
  },
  {
    name: 'Emma Davis',
    email: 'emma@company.com',
    department: 'Product',
    role: 'Product Manager',
    skills: ['Product Strategy', 'User Research', 'Agile', 'Roadmapping'],
    salary: 110000,
    hireDate: new Date('2021-11-12'),
    availability: 'Busy'
  }
];

const projects = [
  {
    name: 'E-Commerce Platform Redesign',
    department: 'Engineering',
    budget: 250000,
    spent: 180000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'Active',
    manager: 'John Manager',
    riskLevel: 'Medium',
    completion: 65,
    description: 'Complete redesign of the e-commerce platform with modern UI/UX',
    teamSize: 8
  },
  {
    name: 'Mobile App Development',
    department: 'Engineering',
    budget: 180000,
    spent: 95000,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-02-28'),
    status: 'Active',
    manager: 'Alice Johnson',
    riskLevel: 'Low',
    completion: 45,
    description: 'Native mobile applications for iOS and Android',
    teamSize: 6
  },
  {
    name: 'Marketing Campaign Q4',
    department: 'Marketing',
    budget: 120000,
    spent: 110000,
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31'),
    status: 'Active',
    manager: 'Carol Williams',
    riskLevel: 'Low',
    completion: 85,
    description: 'Q4 marketing campaign across all digital channels',
    teamSize: 5
  },
  {
    name: 'Data Analytics Infrastructure',
    department: 'IT',
    budget: 300000,
    spent: 75000,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2025-06-30'),
    status: 'Planning',
    manager: 'Bob Smith',
    riskLevel: 'High',
    completion: 20,
    description: 'Building comprehensive data analytics infrastructure',
    teamSize: 4
  },
  {
    name: 'Customer Portal Enhancement',
    department: 'Product',
    budget: 150000,
    spent: 150000,
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-03-31'),
    status: 'Completed',
    manager: 'Emma Davis',
    riskLevel: 'Low',
    completion: 100,
    description: 'Enhanced customer portal with new features and improved UX',
    teamSize: 7
  }
];

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Employee.deleteMany();
    await Financial.deleteMany();
    await Prediction.deleteMany();

    console.log('Data Destroyed...');

    // Create users
    const createdUsers = await User.create(users);
    console.log('Users Created...');

    // Create employees
    const createdEmployees = await Employee.create(employees);
    console.log('Employees Created...');

    // Create projects with user reference
    const projectsWithUser = projects.map(project => ({
      ...project,
      createdBy: createdUsers[0]._id
    }));
    const createdProjects = await Project.create(projectsWithUser);
    console.log('Projects Created...');

    // Assign employees to projects
    await Project.findByIdAndUpdate(createdProjects[0]._id, {
      assignedEmployees: [createdEmployees[0]._id, createdEmployees[1]._id],
      teamSize: 2
    });
    await Employee.findByIdAndUpdate(createdEmployees[0]._id, {
      assignedProjects: [createdProjects[0]._id],
      availability: 'Busy'
    });
    await Employee.findByIdAndUpdate(createdEmployees[1]._id, {
      assignedProjects: [createdProjects[0]._id],
      availability: 'Busy'
    });

    await Project.findByIdAndUpdate(createdProjects[1]._id, {
      assignedEmployees: [createdEmployees[0]._id],
      teamSize: 1
    });

    await Project.findByIdAndUpdate(createdProjects[2]._id, {
      assignedEmployees: [createdEmployees[2]._id],
      teamSize: 1
    });
    await Employee.findByIdAndUpdate(createdEmployees[2]._id, {
      assignedProjects: [createdProjects[2]._id],
      availability: 'Busy'
    });

    console.log('Employees Assigned to Projects...');

    // Create financial records
    const financials = [
      {
        projectId: createdProjects[0]._id,
        projectName: createdProjects[0].name,
        category: 'Salaries',
        amount: 120000,
        date: new Date('2024-01-15'),
        type: 'expense',
        description: 'Team salaries Q1',
        status: 'paid',
        createdBy: createdUsers[0]._id
      },
      {
        projectId: createdProjects[0]._id,
        projectName: createdProjects[0].name,
        category: 'Software',
        amount: 35000,
        date: new Date('2024-02-10'),
        type: 'expense',
        description: 'Development tools and licenses',
        status: 'paid',
        createdBy: createdUsers[0]._id
      },
      {
        projectId: createdProjects[1]._id,
        projectName: createdProjects[1].name,
        category: 'Equipment',
        amount: 45000,
        date: new Date('2024-03-05'),
        type: 'expense',
        description: 'Mobile development devices and equipment',
        status: 'paid',
        createdBy: createdUsers[0]._id
      },
      {
        projectId: createdProjects[2]._id,
        projectName: createdProjects[2].name,
        category: 'Marketing',
        amount: 85000,
        date: new Date('2024-10-15'),
        type: 'expense',
        description: 'Ad spend for Q4 campaign',
        status: 'paid',
        createdBy: createdUsers[0]._id
      },
      {
        projectId: createdProjects[4]._id,
        projectName: createdProjects[4].name,
        category: 'Revenue',
        amount: 300000,
        date: new Date('2024-04-01'),
        type: 'revenue',
        description: 'Project completion revenue',
        status: 'approved',
        createdBy: createdUsers[0]._id
      }
    ];

    await Financial.create(financials);
    console.log('Financial Records Created...');

    console.log('Data Imported Successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Manager: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Project.deleteMany();
    await Employee.deleteMany();
    await Financial.deleteMany();
    await Prediction.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
