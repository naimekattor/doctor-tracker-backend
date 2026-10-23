import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    condition: {
      type: String,
      enum: ['Stable', 'Critical', 'Under Observation', 'Recovered', 'Chronic', 'Routine Checkup'],
      required: [true, 'Patient condition is required'],
      trim: true,
      index: true, // For filtering by patient condition
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
      index: true, // For foreign key lookups and aggregation
    },
  },
  { timestamps: true }
);

// Text search on patient name and contact phone
patientSchema.index({ name: 'text', contactPhone: 'text' });

// Compound index for sorted pagination under a specific doctor
patientSchema.index({ doctor: 1, createdAt: -1 });

// Index for global date-wise filtering and pagination
patientSchema.index({ createdAt: -1 });

export const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
export default Patient;
