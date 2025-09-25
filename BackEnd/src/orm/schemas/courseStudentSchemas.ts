import { model, Schema } from "mongoose";
import { CourseStudent } from "../../interfaces/CourseStudent";

export const courseStudentSchema = new Schema<CourseStudent>({
    courseId: { 
        type: String, 
        required: true 
    },
    studentId: { 
        type: String, 
        required: true 
    },
    enrolledAt: { 
        type: Date, 
        default: Date.now 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// 建立複合索引，確保同一課程的同一學生只能有一條記錄
courseStudentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

courseStudentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const courseStudentModel = model<CourseStudent>('courseStudents', courseStudentSchema);
