export interface Student {
    _id?: string;
    studentId: string;
    name: string;
    department?: string;
    grade?: string;
    class?: string;
    email?: string;
    absences?: number;
    createdAt?: Date;
    updatedAt?: Date;
}