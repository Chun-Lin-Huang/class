export interface Attendance {
    _id: string,
    courseId: string,
    studentId: string,
    attendanceDate: string,
    status: 'present' | 'absent' | 'late',
    checkInTime?: string,
    notes?: string,
    createdAt: string
}

export interface AttendanceSession {
    _id: string,
    courseId: string | {
        _id: string,
        courseName: string,
        courseCode: string
    },
    courseName: string,
    sessionCode: string,
    startTime: string,
    endTime?: string,
    status: 'active' | 'ended',
    attendedStudents: Array<{
        studentId: string,
        userName: string,
        checkInTime: string,
        notes?: string
    }>,
    absentStudents: Array<{
        studentId: string,
        userName: string,
        notes?: string
    }>,
    excusedStudents: Array<{
        studentId: string,
        userName: string,
        notes?: string
    }>,
    attendanceCount?: number,
    createdAt: string,
    updatedAt: string
}

export interface Course {
    _id: string,
    courseName: string,
    courseCode: string,
    teacher: string,
    semester: string,
    schedule: {
        dayOfWeek: number,
        startTime: string,
        endTime: string,
    },
    isActive: boolean,
    createdAt: string,
    updatedAt: string
}
