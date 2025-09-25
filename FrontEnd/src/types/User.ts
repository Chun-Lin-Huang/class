export interface User {
    _id: string,
    userName: string,
    role: 'student' | 'admin',
    studentInfo?: StudentInfo
}

export interface StudentInfo {
    sid: string,
    name: string,
    department: string,
    grade: string,
    class: string,
    email: string,
    absences?: number
}

export interface LoginRequest {
    userName: string,
    password: string
}

export interface RegisterRequest {
    userName: string,
    password: string,
    role: 'student' | 'admin',
    studentInfo?: StudentInfo
}

export interface AuthResponse {
    token: string,
    user: User
}
