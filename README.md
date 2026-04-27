# MEDIQ

MEDIQ is a full-stack healthcare appointment and patient management platform built with the MERN stack. It connects patients, doctors, and admins in one system for doctor discovery, appointment booking, profile management, real-time chat, inquiries, and medicine guidance based on symptoms.

## Project Overview

MEDIQ helps users manage common healthcare workflows through separate dashboards for patients, doctors, and admins.

- Patients can register, find doctors, book appointments, manage profiles, view appointment history, and chat with doctors.
- Doctors can register with documents, manage appointments, view patients, update appointment status, add doctor notes, and track earnings.
- Admins can review doctors, manage patients, manage appointments, view inquiries, and monitor platform activity.
- The system includes a symptom-based medicine assistant and real-time messaging using Socket.IO.

## Tech Stack

### Frontend

- React 19
- React Router
- Axios
- Socket.IO Client
- Recharts
- Lucide React
- React Hot Toast
- jsPDF and jsPDF AutoTable

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- Multer
- bcrypt / bcryptjs
- JSON Web Token
- dotenv

### Tools

- Concurrently
- Nodemon
- Create React App

## Features

## Patient Module

- Patient registration and login
- Patient dashboard
- Profile view and update
- Doctor listing with summary details
- Appointment booking
- Appointment history
- Real-time chat with doctors

## Doctor Module

- Doctor registration with document uploads
- Doctor login
- Doctor dashboard
- Appointment management
- Accept, update, and delete appointments
- Doctor notes for appointments
- Patient list
- Earnings view
- Profile management

## Admin Module

- Admin login
- Admin dashboard analytics
- Patient management
- Doctor approval and management
- Appointment management
- Inquiry/message management
- Default admin seeding on first backend start

## Medicine Assistant

- Symptom-based medicine lookup
- Adult medicine, child medicine, home remedy, diet, and days limit suggestions
- Uses stored medicine data from MongoDB

Note: Medicine suggestions are informational only. Users should consult a verified doctor for proper medical advice.

## Real-Time Chat

- Socket.IO based real-time messaging
- Patient-to-doctor chat
- Chat user list and chat metadata APIs

## Folder Structure

```text
MEDIQ/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── Models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Component/
│   │   ├── Pages/
│   │   ├── Services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── Data/
├── Diagram/
├── documents/
├── package.json
└── README.md
```

## Installation and Setup

### Prerequisites

Make sure these are installed:

- Node.js
- npm
- MongoDB

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mediq.git
cd mediq
```

### 2. Install Dependencies

Install root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Return to the root folder:

```bash
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mediq
```

Optional frontend environment file:

Create `frontend/.env` if you want to configure the API base URL:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Run the Project

From the root folder, run frontend and backend together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run backend
npm run frontend
```

Frontend will run at:

```text
http://localhost:3000
```

Backend will run at:

```text
http://localhost:5000
```

If port `5000` is already busy, the backend automatically tries the next available port.

## Available Scripts

### Root

```bash
npm run dev
```

Runs backend and frontend together.

```bash
npm run backend
```

Runs the backend server with Nodemon.

```bash
npm run frontend
```

Runs the React frontend.

### Backend

```bash
npm start
```

Starts the backend with Node.js.

```bash
npm run dev
```

Starts the backend with Nodemon.

### Frontend

```bash
npm start
```

Starts the React development server.

```bash
npm run build
```

Creates a production build.

```bash
npm test
```

Runs frontend tests.

## Main Routes

### Frontend Routes

- `/` - Home
- `/about` - About
- `/contact` - Contact
- `/doctors` - Doctors
- `/services` - Services
- `/login` - Patient login
- `/register` - Patient registration
- `/chatbot` - Medicine assistant
- `/patient-dashboard` - Patient dashboard
- `/appointments` - Book appointment
- `/patient-appointments` - Patient appointments
- `/doctor-login` - Doctor login
- `/doctor-register` - Doctor registration
- `/doctor-dashboard` - Doctor dashboard
- `/doctor-appointment` - Doctor appointments
- `/doctor-mypatient` - Doctor patients
- `/doctor-earning` - Doctor earnings
- `/doctor-profile` - Doctor profile
- `/login/admin` - Admin login
- `/admin-dashboard` - Admin dashboard
- `/admin-patients` - Patient management
- `/manage-doctors` - Doctor management
- `/admin-appointments` - Appointment management
- `/admin-messages` - Inquiry management

### Backend API Routes

- `/api/register` - Patient registration
- `/api/login` - Patient login
- `/api/patients` - Patient management
- `/api/doctors/register` - Doctor registration
- `/api/doctors/login` - Doctor login
- `/api/doctors/all` - Active doctor list
- `/api/doctors/admin/all` - All doctors for admin
- `/api/doctors/approve/:id` - Approve doctor
- `/api/appointments/book` - Book appointment
- `/api/appointments/all` - Appointment list
- `/api/appointments/doctor/:doctorId` - Doctor appointments
- `/api/chat/send` - Send chat message
- `/api/chat/messages/:user1/:user2` - Chat messages
- `/api/medicines/chat/ai-chat` - Symptom-based medicine assistant
- `/api/inquiries/submit` - Submit contact inquiry
- `/api/admin/login` - Admin login

## Default Admin

When the backend starts for the first time and no admin exists, it creates a default admin:

```text
Admin ID: admin@mediq
Password: admin123
```

For production or public deployment, change this default credential immediately.

## Build for Production

Create a frontend production build:

```bash
cd frontend
npm run build
```

The optimized files will be generated in:

```text
frontend/build
```

## Important Notes for GitHub

Before pushing to GitHub, do not commit:

- `node_modules/`
- `.env`
- uploaded private documents
- large zip files
- personal PDFs or identity documents

Keep only source code, required public assets, documentation, and safe sample data in the repository.

## Future Enhancements

- JWT-based secure route authentication
- Payment integration for appointments
- Email and SMS notifications
- Prescription upload and download
- Advanced doctor search and filters
- Deployment with cloud database
- Admin reports and export features

## Author

Developed by Vivek.

## License

This project is for academic and learning purposes. Add a license before using it in production or distributing it publicly.
