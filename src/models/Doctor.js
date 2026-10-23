import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound text index for global doctor search across fields
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text', email: 'text' });

// Index for date-based sorting and pagination
doctorSchema.index({ createdAt: -1 });

export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
export default Doctor;
