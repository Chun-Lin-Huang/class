import { model, Schema } from "mongoose";

const studentSchema = new Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: false },
    grade: { type: String, required: false },
    class: { type: String, required: false },
    email: { type: String, required: false },
    absences: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// 更新時自動更新 updatedAt
studentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const studentModel = model('students', studentSchema);