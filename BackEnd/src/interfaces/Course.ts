export interface Course {
    _id?: string,
    courseName: string,
    courseCode: string,
    teacher: string,
    semester: string,
    schedule: {
        dayOfWeek: number, // 0-6 (Sunday-Saturday)
        startTime: string, // HH:MM format
        endTime: string,   // HH:MM format
    },
    isActive: boolean,
    createdAt?: Date,
    updatedAt?: Date
}

export interface Attendance {
    _id?: string,
    courseId: string,
    studentId: string,
    attendanceDate: Date,
    status: 'present' | 'absent' | 'late',
    checkInTime?: Date,
    notes?: string,
    createdAt?: Date
}

export interface AttendanceSession {
    _id?: string,
    courseId: string,
    courseName: string,
    sessionCode: string,
    startTime: Date,
    endTime?: Date,
    isActive: boolean,
    status: 'active' | 'ended',
    attendedStudents?: Array<{
        studentId: string,
        userName: string,
        checkInTime: Date,
        notes?: string
    }>,
    absentStudents?: Array<{
        studentId: string,
        userName: string,
        notes?: string
    }>,
    excusedStudents: Array<{
        studentId: string,
        userName: string,
        notes?: string
    }>,
    attendanceRecords?: any[],
    createdAt?: Date,
    updatedAt?: Date
}
