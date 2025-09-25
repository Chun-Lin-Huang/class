import { model, Schema } from "mongoose";
import { User } from "../../interfaces/User";

const studentInfoSchema = new Schema({
    sid: { type: String, required: false },
    name: { type: String, required: false },
    department: { type: String, required: false },
    grade: { type: String, required: false },
    class: { type: String, required: false },
    email: { type: String, required: false },
    absences: { type: Number, default: 0 }
});

export const userSchema = new Schema<User>({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['student', 'admin'], 
        required: true,
        default: 'student'
    },
    studentInfo: { type: studentInfoSchema, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// 更新時自動更新 updatedAt
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const userModel = model<User>('users', userSchema);
