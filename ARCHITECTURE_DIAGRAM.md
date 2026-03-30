# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    React Frontend Application                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │ Dashboard  │  │ Projects   │  │ Employees  │  │    AI      │ │  │
│  │  │   Page     │  │   Page     │  │   Page     │  │  Insights  │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │  │
│  │         └──────────────────┬──────────────────┘                  │  │
│  │                            │                                      │  │
│  │                  ┌─────────▼─────────┐                           │  │
│  │                  │   API Service     │                           │  │
│  │                  │  (Axios/Fetch)    │                           │  │
│  │                  └─────────┬─────────┘                           │  │
│  └────────────────────────────┼─────────────────────────────────────┘  │
└─────────────────────────────┼─────────────────────────────────────────┘
                               │
                               │ HTTP/HTTPS
                               │ JSON
                               │ JWT Token
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                           BACKEND LAYER                                  │
│                        (Node.js + Express.js)                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      API Gateway (server.js)                      │  │
│  │                    CORS │ Body Parser │ Auth                      │  │
│  └──────────────────────────┬───────────────────────────────────────┘  │
│                             │                                           │
│              ┌──────────────┼──────────────┐                           │
│              │              │              │                           │
│  ┌───────────▼───┐  ┌──────▼──────┐  ┌───▼──────────┐                │
│  │  Middleware   │  │   Routes    │  │  Controllers │                │
│  │               │  │             │  │              │                │
│  │  • auth.js    │  │ • auth      │  │ • auth       │                │
│  │  • error      │  │ • projects  │  │ • projects   │                │
│  │    Handler    │  │ • employees │  │ • employees  │                │
│  │               │  │ • financials│  │ • financials │                │
│  │               │  │ • analytics │  │ • analytics  │                │
│  │               │  │ • ai        │  │ • ai         │                │
│  └───────┬───────┘  └──────┬──────┘  └───┬──────────┘                │
│          │                  │             │                            │
│          │        ┌─────────▼─────────────▼─────┐                     │
│          │        │      Business Logic          │                     │
│          │        │   • Validation               │                     │
│          └────────│   • Authentication           │                     │
│                   │   • Authorization            │                     │
│                   │   • Data Processing          │                     │
│                   └─────────┬────────────────────┘                     │
│                             │                                           │
│                   ┌─────────▼────────────┐                             │
│                   │  AI Algorithms       │                             │
│                   │  (aiAlgorithms.js)   │                             │
│                   │  • Success Prediction│                             │
│                   │  • Risk Analysis     │                             │
│                   │  • Recommendations   │                             │
│                   └─────────┬────────────┘                             │
│                             │                                           │
│                   ┌─────────▼────────────┐                             │
│                   │  Mongoose Models     │                             │
│                   │  • User              │                             │
│                   │  • Project           │                             │
│                   │  • Employee          │                             │
│                   │  • Financial         │                             │
│                   │  • Prediction        │                             │
│                   └─────────┬────────────┘                             │
└───────────────────────────┼──────────────────────────────────────────┘
                             │
                             │ Mongoose ODM
                             │ TCP/IP
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                        DATABASE LAYER                                 │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      MongoDB Database                        │   │
│  │                                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │  Users   │  │ Projects │  │Employees │  │Financial │   │   │
│  │  │Collection│  │Collection│  │Collection│  │Collection│   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  │                                                              │   │
│  │  ┌──────────┐                                               │   │
│  │  │Prediction│                                               │   │
│  │  │Collection│                                               │   │
│  │  └──────────┘                                               │   │
│  │                                                              │   │
│  │  Indexes │ Relationships │ Validations                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Options: Local MongoDB │ MongoDB Atlas (Cloud)                     │
└───────────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

```
CLIENT                  BACKEND                   DATABASE
  │                       │                         │
  │  1. Login Request     │                         │
  ├──────────────────────►│                         │
  │  POST /api/auth/login │                         │
  │  {email, password}    │                         │
  │                       │                         │
  │                       │  2. Query User          │
  │                       ├────────────────────────►│
  │                       │  User.findOne({email})  │
  │                       │                         │
  │                       │  3. User Data           │
  │                       │◄────────────────────────┤
  │                       │  {user document}        │
  │                       │                         │
  │                       │  4. Verify Password     │
  │                       │  (bcrypt.compare)       │
  │                       │                         │
  │                       │  5. Generate JWT        │
  │                       │  (jwt.sign)             │
  │                       │                         │
  │  6. Login Response    │                         │
  │◄──────────────────────┤                         │
  │  {token, user}        │                         │
  │                       │                         │
  │  7. Get Projects      │                         │
  ├──────────────────────►│                         │
  │  GET /api/projects    │                         │
  │  Authorization: Bearer│                         │
  │                       │                         │
  │                       │  8. Verify Token        │
  │                       │  (jwt.verify)           │
  │                       │                         │
  │                       │  9. Query Projects      │
  │                       ├────────────────────────►│
  │                       │  Project.find()         │
  │                       │  .populate('employees') │
  │                       │                         │
  │                       │  10. Projects Data      │
  │                       │◄────────────────────────┤
  │                       │  [{project1}, ...]      │
  │                       │                         │
  │  11. Projects Response│                         │
  │◄──────────────────────┤                         │
  │  {success, data}      │                         │
  │                       │                         │
```

## Data Flow for AI Predictions

```
┌──────────────┐
│  Frontend    │
│  AI Insights │
└──────┬───────┘
       │
       │ POST /api/ai/predict-success
       │ {projectId}
       │
┌──────▼────────────────┐
│  AI Controller        │
│  predictSuccess()     │
└──────┬────────────────┘
       │
       │ 1. Fetch Project Data
       │
┌──────▼────────────────┐
│  MongoDB              │
│  Project.findById()   │
└──────┬────────────────┘
       │
       │ {project data}
       │
┌──────▼────────────────┐
│  AI Algorithms        │
│  predictProjectSuccess│
└──────┬────────────────┘
       │
       │ Calculate:
       ├─ budgetUtilization
       ├─ timeProgress
       ├─ completionRate
       ├─ teamSize factor
       └─ riskLevel score
       │
       │ Weighted Scoring:
       ├─ Budget: 25%
       ├─ Time: 20%
       ├─ Completion: 30%
       ├─ Team: 10%
       └─ Risk: 15%
       │
       │ Generate:
       ├─ successProbability
       ├─ riskScore
       ├─ confidence
       └─ recommendations[]
       │
┌──────▼────────────────┐
│  Save Prediction      │
│  Prediction.create()  │
└──────┬────────────────┘
       │
       │ {prediction record}
       │
┌──────▼────────────────┐
│  Response to Client   │
│  {success, data}      │
└───────────────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. User enters:          2. Backend validates:     3. Database:
   • Name                   • Email format             • Check duplicate
   • Email                  • Password length          • Create user
   • Password               • Required fields          • Hash password
   • Department                                        • Save to DB
        │                         │                         │
        ▼                         ▼                         ▼
   Frontend Form  ───────►  Validation  ───────►  MongoDB Users
                            & Hashing               Collection
        │                         │                         │
        └─────────────────────────┴─────────────────────────┘
                                  │
                          4. Generate JWT
                                  │
                          5. Return token + user


┌─────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────┘

1. User enters:          2. Backend:                3. Response:
   • Email                  • Find user                • JWT token
   • Password               • Compare password         • User data
        │                   • Generate token           • Redirect
        ▼                         ▼                         ▼
   Login Form   ───────►  Authentication  ───────►  Dashboard
                          bcrypt.compare
                          jwt.sign


┌─────────────────────────────────────────────────────────────┐
│                  PROTECTED REQUEST FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. Client Request        2. Middleware:             3. Controller:
   with Token               • Extract token            • Process request
   in Header                • Verify token             • Query database
                            • Attach user              • Return data
        │                         │                         │
        ▼                         ▼                         ▼
   API Request  ───────►  auth.js  ───────►  Execute Business
   Authorization:         Middleware         Logic
   Bearer <token>
```

## Database Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                          │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────┐
                    │  Users   │
                    │          │
                    │ • _id    │
                    │ • name   │
                    │ • email  │
                    │ • role   │
                    └────┬─────┘
                         │
                         │ createdBy
                         │ (One-to-Many)
                         │
                    ┌────▼──────┐
            ┌───────┤ Projects  │
            │       │           │
            │       │ • _id     │
            │       │ • name    │
            │       │ • budget  │───────┐
            │       │ • status  │       │
            │       └────┬──────┘       │
            │            │              │
            │            │assignedEmployees projectId
            │            │(Many-to-Many) │(One-to-Many)
            │            │              │
        projectId  ┌────▼──────┐  ┌────▼─────────┐
      (One-to-Many)│ Employees │  │  Financials  │
            │      │           │  │              │
            │      │ • _id     │  │ • _id        │
            │      │ • name    │  │ • projectId  │
            │      │ • skills  │  │ • amount     │
            │      │ • salary  │  │ • type       │
            │      └───────────┘  └──────────────┘
            │
            │
      ┌─────▼────────┐
      │ Predictions  │
      │              │
      │ • _id        │
      │ • projectId  │
      │ • riskScore  │
      │ • recommendations│
      └──────────────┘
```

## Folder Structure Tree

```
project-portfolio/
│
├── frontend/                    # React Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── App.tsx
│   │   ├── services/
│   │   │   └── api.js          # ← API Service Layer
│   │   └── styles/
│   └── package.json
│
├── backend/                     # Node.js Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── employeeController.js
│   │   ├── financialController.js
│   │   ├── analyticsController.js
│   │   └── aiController.js
│   ├── middleware/             # Request processing
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/                 # Database schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Employee.js
│   │   ├── Financial.js
│   │   └── Prediction.js
│   ├── routes/                 # API endpoints
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── employees.js
│   │   ├── financials.js
│   │   ├── analytics.js
│   │   └── ai.js
│   ├── utils/                  # Utilities
│   │   ├── aiAlgorithms.js
│   │   └── seedData.js
│   ├── .env                    # Environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── server.js               # Entry point
│   └── README.md
│
├── QUICK_START_GUIDE.md        # Setup instructions
├── FRONTEND_INTEGRATION_GUIDE.md # Integration guide
├── API_TESTING_EXAMPLES.md     # API examples
└── BACKEND_SUMMARY.md          # Overview
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                           │
│  React.js │ TypeScript │ Tailwind CSS │ Recharts            │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTP/HTTPS (REST)
                         JWT Tokens
                              │
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                            │
│  Node.js │ Express.js │ JWT │ Bcrypt │ CORS                 │
└─────────────────────────────────────────────────────────────┘
                              │
                      Mongoose ODM
                              │
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  MongoDB │ Collections │ Documents │ Indexes                │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       PRODUCTION                              │
└──────────────────────────────────────────────────────────────┘

┌───────────────┐         ┌──────────────────┐
│   Vercel      │         │   Railway/       │
│   (Frontend)  │◄───────►│   Heroku         │
│               │  HTTPS  │   (Backend)      │
│ React Build   │  REST   │   Node.js        │
└───────────────┘         └────────┬─────────┘
                                   │
                                   │ MongoDB
                                   │ Protocol
                                   │
                          ┌────────▼─────────┐
                          │  MongoDB Atlas   │
                          │  (Database)      │
                          │  Cloud Hosted    │
                          └──────────────────┘

Environment Variables:
Frontend: REACT_APP_API_URL=https://api.yourapp.com
Backend:  MONGODB_URI, JWT_SECRET, NODE_ENV=production
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

Layer 1: Transport Security
├── HTTPS/TLS encryption
└── Secure headers (CORS)

Layer 2: Authentication
├── JWT token-based auth
├── Token expiration (7 days)
└── Bcrypt password hashing (10 rounds)

Layer 3: Authorization
├── Protected routes (middleware)
├── Role-based access control
└── User ownership validation

Layer 4: Data Validation
├── Mongoose schema validation
├── Express input sanitization
└── MongoDB injection prevention

Layer 5: Error Handling
├── Global error handler
├── Secure error messages
└── Logging (development)
```

This architecture provides:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Performance
- ✅ Flexibility
