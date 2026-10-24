import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { Doctor } from '../src/models/Doctor.js';
import { Patient } from '../src/models/Patient.js';
import { createDoctorSchema } from '../src/validators/doctorValidator.js';
import { createPatientSchema } from '../src/validators/patientValidator.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/doctor_tracker';

const mockDoctors = [
    { name: 'Dr. Sarah Jenkins', specialization: 'Cardiology', hospital: 'City General Hospital', phone: '+1-555-0101', email: 'sjenkins@hospital.org' },
    { name: 'Dr. Michael Chang', specialization: 'Neurology', hospital: 'Memorial Neuroscience Center', phone: '+1-555-0102', email: 'mchang@memorial.org' },
    { name: 'Dr. Alisha Patel', specialization: 'Pediatrics', hospital: 'St. Jude Children Wing', phone: '+1-555-0103', email: 'apatel@stjude.org' },
    { name: 'Dr. Robert Martinez', specialization: 'Orthopedics', hospital: 'City General Hospital', phone: '+1-555-0104', email: 'rmartinez@hospital.org' },
    { name: 'Dr. Emily Vance', specialization: 'Dermatology', hospital: 'Metro Health Clinic', phone: '+1-555-0105', email: 'evance@metrohealth.org' },
    { name: 'Dr. Tariq Rahman', specialization: 'Cardiology', hospital: 'United Hospital', phone: '+1-555-0106', email: 'trahman@united.org' },
    { name: 'Dr. Lisa Ray', specialization: 'Oncology', hospital: 'Memorial Neuroscience Center', phone: '+1-555-0107', email: 'lray@memorial.org' },
    { name: 'Dr. David Kim', specialization: 'Gastroenterology', hospital: 'Metro Health Clinic', phone: '+1-555-0108', email: 'dkim@metrohealth.org' },
    { name: 'Dr. Elena Rostova', specialization: 'Endocrinology', hospital: 'City General Hospital', phone: '+1-555-0109', email: 'erostova@hospital.org' },
    { name: 'Dr. James Wilson', specialization: 'General Medicine', hospital: 'Community First Clinic', phone: '+1-555-0110', email: 'jwilson@community.org' },
];

const conditions = ['Stable', 'Critical', 'Under Observation', 'Recovered', 'Chronic', 'Routine Checkup'];
const genders = ['Male', 'Female', 'Other'];
const firstNames = ['Liam', 'Emma', 'Noah', 'Olivia', 'William', 'Ava', 'James', 'Sophia', 'Benjamin', 'Isabella', 'Mason', 'Mia', 'Ethan', 'Harper', 'Alexander', 'Evelyn'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 1. Clear existing collections
        console.log('Clearing old collections...');
        await Promise.all([User.deleteMany({}), Doctor.deleteMany({}), Patient.deleteMany({})]);

        // 2. Create Admin Account
        console.log('Seeding Admin credentials...');
        const admin = new User({
            email: 'admin@doctortracker.com',
            password: 'AdminPassword123!',
            role: 'admin',
        });
        await admin.save();
        console.log('Admin seeded: admin@doctortracker.com / AdminPassword123!');

        // 3. Validate & Insert Doctors
        console.log('Validating and seeding Doctors...');
        const validDoctors = [];
        for (const doc of mockDoctors) {
            // Validate through Zod before insertion
            const validated = createDoctorSchema.parse(doc);
            validDoctors.push(validated);
        }
        const insertedDoctors = await Doctor.insertMany(validDoctors);
        console.log(`Successfully seeded ${insertedDoctors.length} doctors.`);

        // 4. Validate & Insert Patients
        console.log('Validating and seeding Patients...');
        const patientPayloads = [];

        for (let i = 0; i < 40; i++) {
            const assignedDoctor = insertedDoctors[i % insertedDoctors.length];
            const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];

            const patientData = {
                name: `${randomFirstName} ${randomLastName}`,
                age: Math.floor(Math.random() * 70) + 5,
                gender: genders[Math.floor(Math.random() * genders.length)],
                condition: conditions[Math.floor(Math.random() * conditions.length)],
                contactPhone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
                doctor: assignedDoctor._id.toString(),
            };

            // Validate patient payload through Zod
            const validatedPatient = createPatientSchema.parse(patientData);

            // Stagger createdAt across the last 30 days to test date-based analytics
            const daysAgo = Math.floor(Math.random() * 30);
            const createdAtDate = new Date();
            createdAtDate.setDate(createdAtDate.getDate() - daysAgo);

            patientPayloads.push({
                ...validatedPatient,
                createdAt: createdAtDate,
                updatedAt: createdAtDate,
            });
        }

        const insertedPatients = await Patient.insertMany(patientPayloads);
        console.log(`Successfully seeded ${insertedPatients.length} patients.`);

        console.log('\n--- Seed Complete ---');
        console.log(`Doctors: ${insertedDoctors.length}`);
        console.log(`Patients: ${insertedPatients.length}`);
        console.log(`Admin Email: admin@doctortracker.com`);
        console.log(`Admin Password: AdminPassword123!`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedDatabase();