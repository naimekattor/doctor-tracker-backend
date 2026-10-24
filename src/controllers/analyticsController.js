import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

/**
 * Get system analytics and summary dashboard metrics
 * @route GET /api/analytics
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDoctors,
      totalPatients,
      specializationStats,
      genderStats,
      hospitalStats,
      conditionStats,
      admissionsTrend,
      doctorRegistrationsTrend,
      topDoctors,
      recentPatients,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      // Doctors grouped by specialization
      Doctor.aggregate([
        { $group: { _id: '$specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Patients grouped by gender
      Patient.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      // Doctors grouped by hospital
      Doctor.aggregate([
        { $group: { _id: '$hospital', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Patients grouped by clinical condition (Condition breakdown)
      Patient.aggregate([
        { $group: { _id: '$condition', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Date-based patient admissions trend (Date-based statistics)
      Patient.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Date-based doctor registrations trend
      Doctor.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Patients per doctor
      Patient.aggregate([
        { $group: { _id: '$doctor', patientCount: { $sum: 1 } } },
        { $sort: { patientCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctorDetails',
          },
        },
        { $unwind: '$doctorDetails' },
        {
          $project: {
            _id: 1,
            patientCount: 1,
            name: '$doctorDetails.name',
            specialization: '$doctorDetails.specialization',
            hospital: '$doctorDetails.hospital',
          },
        },
      ]),
      // Recent patients
      Patient.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('doctor', 'name specialization hospital'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalDoctors,
          totalPatients,
        },
        specializationBreakdown: specializationStats.map((item) => ({
          specialization: item._id,
          count: item.count,
        })),
        genderBreakdown: genderStats.map((item) => ({
          gender: item._id,
          count: item.count,
        })),
        hospitalBreakdown: hospitalStats.map((item) => ({
          hospital: item._id,
          count: item.count,
        })),
        conditionBreakdown: conditionStats.map((item) => ({
          condition: item._id,
          count: item.count,
        })),
        admissionsTrend: admissionsTrend.map((item) => ({
          date: item._id,
          admissions: item.count,
        })),
        doctorRegistrationsTrend: doctorRegistrationsTrend.map((item) => ({
          date: item._id,
          registrations: item.count,
        })),
        topDoctorsByPatients: topDoctors,
        recentPatients,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
};
