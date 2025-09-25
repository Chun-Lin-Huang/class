export interface CourseStudent {
    _id?: string;
    courseId: string;
    studentId: string;
    enrolledAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CourseStudentWithDetails extends CourseStudent {
    studentInfo: {
        userName: string;
        studentInfo: {
            sid: string;
            name: string;
            department: string;
            grade: string;
            class: string;
            email: string;
        };
    };
}

export interface ImportStudentsRequest {
    courseId: string;
    studentIds: string[];
}

export interface ImportStudentsResponse {
    success: boolean;
    message: string;
    enrolledCount: number;
    alreadyEnrolledCount: number;
    failedCount: number;
    details: {
        enrolled: string[];
        alreadyEnrolled: string[];
        failed: string[];
    };
}
