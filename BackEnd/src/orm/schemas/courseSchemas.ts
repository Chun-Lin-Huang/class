import { model, Schema } from "mongoose";
import { Course, Attendance, AttendanceSession } from "../../interfaces/Course";

const scheduleSchema = new Schema({
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
});

export const courseSchema = new Schema<Course>({
    courseName: { type: String, required: true },
    courseCode: { type: String, required: true, unique: true },
    teacher: { type: String, required: false, default: '未指定' },
    semester: { type: String, required: false, default: '當前學期' },
    schedule: { type: scheduleSchema, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

courseSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const courseModel = model<Course>('courses', courseSchema);

export const attendanceSchema = new Schema<Attendance>({
    courseId: { type: String, required: true },
    studentId: { type: String, required: true },
    attendanceDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['present', 'absent', 'late'], 
        required: true 
    },
    checkInTime: { type: Date },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export const attendanceModel = model<Attendance>('attendances', attendanceSchema);

export const attendanceSessionSchema = new Schema<AttendanceSession>({
    courseId: { type: String, required: true },
    courseName: { type: String, required: true },
    sessionCode: { type: String, required: true, unique: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    attendedStudents: [{
        studentId: { type: String, required: true },
        userName: { type: String, required: true },
        checkInTime: { type: Date, default: Date.now },
        notes: { type: String, required: false }
    }],
    absentStudents: [{
        studentId: { type: String, required: true },
        userName: { type: String, required: true },
        notes: { type: String, required: false }
    }],
    excusedStudents: [{
        studentId: { type: String, required: true },
        userName: { type: String, required: true },
        notes: { type: String, required: false }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const attendanceSessionModel = model<AttendanceSession>('attendanceSessions', attendanceSessionSchema);
