# Doctor Tracker - Backend API

RESTful API backend for the Doctor Tracker application, built with Express.js, MongoDB (Mongoose), JWT authentication, and Zod schema validation.

---

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile
│   │   ├── doctorController.js   # Doctor CRUD, search, filter, and pagination
│   │   ├── patientController.js  # Patient CRUD, doctor assignment, and lookup
│   │   └── analyticsController.js# Summary stats and aggregate breakdown metrics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification and role authorization
│   │   ├── errorMiddleware.js    # 404 handler and central error formatter
│   │   └── validateMiddleware.js # Reusable Zod request validator
│   ├── models/
│   │   ├── User.js               # User auth model (admin)
│   │   ├── Doctor.js             # Doctor schema with text indexes
│   │   └── Patient.js            # Patient schema with foreign key to Doctor
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── doctorRoutes.js       # /api/doctors endpoints
│   │   ├── patientRoutes.js      # /api/patients endpoints
│   │   └── analyticsRoutes.js    # /api/analytics endpoints
│   ├── validators/
│   │   ├── authValidator.js      # Zod validation for auth requests
│   │   ├── doctorValidator.js    # Zod validation for doctor requests
│   │   └── patientValidator.js   # Zod validation for patient requests
│   ├── utils/
│   │   ├── generateToken.js      # JWT token generator
│   │   └── hashPassword.js       # Password hashing & comparison helpers
│   ├── app.js                    # Express app initialization & route mounting
│   └── server.js                 # Entry point with database connection
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Tech Stack

- **Runtime**: Node.js (ES Modules: `"type": "module"`)
- **Web Framework**: Express.js 5
- **Database & ODM**: MongoDB & Mongoose 9
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation**: Zod 4
- **Security & Utilities**: CORS, dotenv, nodemon

---

## Environment Variables

Configure your environment in `.env` (refer to `.env.example`):

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port for the HTTP server | `5000` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017/doctor_tracker` |
| `JWT_SECRET` | Secret key for JWT signing | `your_jwt_secret_key` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:3000` |

---

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
pnpm run dev
```

### 4. Run Production Server
```bash
pnpm start
```

---

## API Endpoints

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` in headers.

### Health Check
- `GET /api/health` - Check API status (Public)

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new admin account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Protected | Get profile of currently logged-in user |

### Doctors (`/api/doctors`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Public | List doctors with search, filters & pagination (`?search=`, `?specialization=`, `?hospital=`, `?page=`, `?limit=`) |
| `GET` | `/api/doctors/:id` | Public | Get doctor details by ID (including patient count) |
| `POST` | `/api/doctors` | Protected | Create a new doctor |
| `PUT` | `/api/doctors/:id` | Protected | Update doctor information |
| `DELETE`| `/api/doctors/:id` | Protected | Delete doctor (blocked if patients are assigned) |

### Patients (`/api/patients`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/patients` | Public | List patients with search, filters & pagination (`?search=`, `?doctor=`, `?gender=`, `?condition=`, `?page=`, `?limit=`) |
| `GET` | `/api/patients/:id` | Public | Get patient details by ID with populated doctor |
| `POST` | `/api/patients` | Protected | Create a new patient record assigned to a doctor |
| `PUT` | `/api/patients/:id` | Protected | Update patient record |
| `DELETE`| `/api/patients/:id` | Protected | Delete patient record |

### Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics` | Protected | Get aggregate metrics: total counts, doctor specializations, hospital breakdown, gender distribution, top doctors |

---

## Request / Response Samples

### Register Admin
**`POST /api/auth/register`**
```json
{
  "email": "admin@example.com",
  "password": "Password123"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "6790...",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Create Doctor
**`POST /api/doctors`**
```json
{
  "name": "Dr. Sarah Jenkins",
  "specialization": "Cardiology",
  "hospital": "City Central Hospital",
  "phone": "+1-555-0192",
  "email": "s.jenkins@hospital.org"
}
```

### Create Patient
**`POST /api/patients`**
```json
{
  "name": "John Doe",
  "age": 42,
  "gender": "Male",
  "condition": "Hypertension",
  "contactPhone": "+1-555-0344",
  "doctor": "6790a1b2c3d4e5f678901234"
}
```
