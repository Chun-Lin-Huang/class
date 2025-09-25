export enum api{
    // 認證相關
    login = "http://localhost:2083/api/v1/auth/login",
    register = "http://localhost:2083/api/v1/auth/register",
    me = "http://localhost:2083/api/v1/auth/me",

    // 課程相關
    courses = "http://localhost:2083/api/v1/courses",
    COURSES = "http://localhost:2083/api/v1/courses",

    // 點名相關
    ATTENDANCE = "http://localhost:2083/api/v1/attendance",
    checkIn = "http://localhost:2083/api/v1/attendance/check-in",
    studentRecords = "http://localhost:2083/api/v1/attendance/student-records",
    startSession = "http://localhost:2083/api/v1/attendance/start-session",
    endSession = "http://localhost:2083/api/v1/attendance/end-session",
    courseStats = "http://localhost:2083/api/v1/attendance/course-stats",
    activeSessions = "http://localhost:2083/api/v1/attendance/active-sessions",
    allSessions = "http://localhost:2083/api/v1/attendance/all-sessions",
    courseStudents = "http://localhost:2083/api/v1/attendance/course-students",
    manualAttendance = "http://localhost:2083/api/v1/attendance/manual-attendance",
    updateAttendanceStatus = "http://localhost:2083/api/v1/attendance/update-attendance-status",
    exportExcel = "http://localhost:2083/api/v1/attendance/export-excel",
    randomSelection = "http://localhost:2083/api/v1/attendance/random-selection",

        // 課程學生管理相關
        enrollStudent = "http://localhost:2083/api/v1/course-students/enroll",
        importStudents = "http://localhost:2083/api/v1/course-students/import",
        importStudentsCSV = "http://localhost:2083/api/v1/course-students/import-csv",
        getCourseStudents = "http://localhost:2083/api/v1/course-students/course",
        getAllStudents = "http://localhost:2083/api/v1/course-students/students",
        removeStudentFromCourse = "http://localhost:2083/api/v1/course-students/course",
        createStudent = "http://localhost:2083/api/v1/course-students/create-student",

    // 舊的 API（保留向後兼容）
    findAll = "http://localhost:2083/api/v1/user/findAll"
}