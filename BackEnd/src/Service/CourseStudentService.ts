import { Service } from "../abstract/Service";
import { courseStudentModel } from "../orm/schemas/courseStudentSchemas";
import { userModel } from "../orm/schemas/userSchemas";
import { studentModel } from "../orm/schemas/studentSchemas";
import { courseModel } from "../orm/schemas/courseSchemas";
import { resp } from "../utils/resp";
import { CourseStudent, CourseStudentWithDetails, ImportStudentsRequest, ImportStudentsResponse } from "../interfaces/CourseStudent";
import { Student } from "../interfaces/Student";
import { logger } from "../middlewares/log";

export class CourseStudentService extends Service {

    /**
     * 將學生加入課程
     * @param courseId 課程ID
     * @param studentId 學生ID
     * @returns 操作結果
     */
    public async enrollStudent(courseId: string, studentId: string): Promise<resp<CourseStudent | undefined>> {
        const response: resp<CourseStudent | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 檢查課程是否存在
            const course = await courseModel.findById(courseId);
            if (!course) {
                response.code = 404;
                response.message = "課程不存在";
                return response;
            }

            // 檢查學生是否存在
            const student = await studentModel.findById(studentId);
            if (!student) {
                response.code = 404;
                response.message = "學生不存在";
                return response;
            }

            // 檢查是否已經註冊
            const existingEnrollment = await courseStudentModel.findOne({ courseId, studentId });
            if (existingEnrollment) {
                response.code = 409;
                response.message = "學生已經註冊此課程";
                return response;
            }

            // 創建註冊記錄
            const enrollment = new courseStudentModel({
                courseId,
                studentId,
                enrolledAt: new Date()
            });

            response.body = await enrollment.save();
            response.message = "學生註冊成功";

        } catch (error) {
            logger.error('Error enrolling student:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }
        return response;
    }

    /**
     * 批量匯入學生到課程
     * @param request 匯入請求
     * @returns 匯入結果
     */
    public async importStudents(request: ImportStudentsRequest): Promise<resp<ImportStudentsResponse | undefined>> {
        const response: resp<ImportStudentsResponse | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const { courseId, studentIds } = request;
            
            // 檢查課程是否存在
            const course = await courseModel.findById(courseId);
            if (!course) {
                response.code = 404;
                response.message = "課程不存在";
                return response;
            }

            const result: ImportStudentsResponse = {
                success: true,
                message: "",
                enrolledCount: 0,
                alreadyEnrolledCount: 0,
                failedCount: 0,
                details: {
                    enrolled: [],
                    alreadyEnrolled: [],
                    failed: []
                }
            };

            // 批量處理學生註冊
            for (const studentId of studentIds) {
                try {
                    // 檢查學生是否存在且角色為學生
                    const student = await userModel.findById(studentId);
                    if (!student || student.role !== 'student') {
                        result.details.failed.push(studentId);
                        result.failedCount++;
                        continue;
                    }

                    // 檢查是否已經註冊
                    const existingEnrollment = await courseStudentModel.findOne({ courseId, studentId });
                    if (existingEnrollment) {
                        result.details.alreadyEnrolled.push(studentId);
                        result.alreadyEnrolledCount++;
                        continue;
                    }

                    // 創建註冊記錄
                    await courseStudentModel.create({
                        courseId,
                        studentId,
                        enrolledAt: new Date(),
                        isActive: true
                    });

                    result.details.enrolled.push(studentId);
                    result.enrolledCount++;

                } catch (error) {
                    logger.error(`Error enrolling student ${studentId}:`, error);
                    result.details.failed.push(studentId);
                    result.failedCount++;
                }
            }

            // 設定結果訊息
            if (result.enrolledCount > 0) {
                result.message += `成功註冊 ${result.enrolledCount} 名學生`;
            }
            if (result.alreadyEnrolledCount > 0) {
                result.message += result.message ? `，${result.alreadyEnrolledCount} 名學生已註冊` : `${result.alreadyEnrolledCount} 名學生已註冊`;
            }
            if (result.failedCount > 0) {
                result.message += result.message ? `，${result.failedCount} 名學生註冊失敗` : `${result.failedCount} 名學生註冊失敗`;
            }

            response.body = result;
            response.message = "批量匯入完成";

        } catch (error) {
            logger.error('Error importing students:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }
        return response;
    }

    /**
     * 獲取課程的所有學生
     * @param courseId 課程ID
     * @returns 學生列表
     */
    public async getCourseStudents(courseId: string): Promise<resp<CourseStudentWithDetails[] | undefined>> {
        const response: resp<CourseStudentWithDetails[] | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const enrollments = await courseStudentModel
                .find({ courseId })
                .sort({ enrolledAt: 1 });

            // 手動填充學生資訊
            const enrollmentsWithDetails = await Promise.all(
                enrollments.map(async (enrollment) => {
                    const student = await studentModel.findById(enrollment.studentId);
                    return {
                        ...enrollment.toObject(),
                        studentInfo: student
                    };
                })
            );

            response.body = enrollmentsWithDetails as any;
            response.message = "獲取課程學生列表成功";

        } catch (error) {
            logger.error('Error getting course students:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }
        return response;
    }

    /**
     * 獲取所有學生（用於匯入選擇）
     * @returns 學生列表
     */
    public async getAllStudents(): Promise<resp<any[] | undefined>> {
        const response: resp<any[] | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const students = await studentModel
                .find()
                .sort({ studentId: 1 });

            response.body = students;
            response.message = "獲取學生列表成功";

        } catch (error) {
            logger.error('Error getting all students:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }
        return response;
    }

    /**
     * 從課程中移除學生
     * @param courseId 課程ID
     * @param studentId 學生ID
     * @returns 操作結果
     */
    public async removeStudentFromCourse(courseId: string, studentId: string): Promise<resp<any>> {
        const response: resp<any> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const result = await courseStudentModel.findOneAndDelete(
                { courseId, studentId }
            );

            if (!result) {
                response.code = 404;
                response.message = "學生未註冊此課程";
                return response;
            }

            response.message = "學生已從課程中移除";

        } catch (error) {
            logger.error('Error removing student from course:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }
        return response;
    }

    /**
     * CSV匯入學生到課程
     * @param courseId 課程ID
     * @param csvData CSV數據
     * @returns 匯入結果
     */
    public async importStudentsFromCSV(courseId: string, csvData: string): Promise<resp<ImportStudentsResponse | undefined>> {
        const response: resp<ImportStudentsResponse | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 檢查課程是否存在
            const course = await courseModel.findById(courseId);
            if (!course) {
                response.code = 404;
                response.message = "課程不存在";
                return response;
            }

            // 解析CSV數據
            const lines = csvData.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                response.code = 400;
                response.message = "CSV格式不正確，至少需要標題行和一行數據";
                return response;
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const studentIdIndex = headers.findIndex(h => 
                h.includes('學號') || h.includes('studentid') || h === 'student_id'
            );
            const studentNameIndex = headers.findIndex(h => 
                h.includes('姓名') || h.includes('name') || h.includes('username') || h === 'name'
            );
            const departmentIndex = headers.findIndex(h => 
                h.includes('院系') || h.includes('department') || h === 'department'
            );
            const classIndex = headers.findIndex(h => 
                h.includes('班級') || h.includes('class') || h === 'class'
            );

            if (studentIdIndex === -1 && studentNameIndex === -1) {
                response.code = 400;
                response.message = "CSV必須包含學號或姓名字段";
                return response;
            }

            let successCount = 0;
            let failureCount = 0;
            const errors: string[] = [];

            // 處理每一行數據
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',').map(cell => cell.trim());
                
                try {
                    let student = null;
                    
                    // 優先使用學號查找
                    if (studentIdIndex !== -1 && row[studentIdIndex]) {
                        student = await studentModel.findOne({ 
                            studentId: row[studentIdIndex]
                        });
                    }
                    
                    // 如果學號找不到，使用姓名查找
                    if (!student && studentNameIndex !== -1 && row[studentNameIndex]) {
                        student = await studentModel.findOne({ 
                            name: row[studentNameIndex]
                        });
                    }

                    if (!student) {
                        // 如果找不到現有學生，創建新學生資料
                        if (studentIdIndex !== -1 && row[studentIdIndex] && studentNameIndex !== -1 && row[studentNameIndex]) {
                            try {
                                // 創建新學生資料
                                const newStudent = new studentModel({
                                    studentId: row[studentIdIndex],
                                    name: row[studentNameIndex],
                                    department: departmentIndex !== -1 ? row[departmentIndex] : '',
                                    grade: '',
                                    class: classIndex !== -1 ? row[classIndex] : '',
                                    email: `${row[studentIdIndex]}@student.edu`,
                                    absences: 0
                                });
                                
                                const savedStudent = await newStudent.save();
                                student = savedStudent;
                            } catch (createError) {
                                logger.error(`創建學生資料失敗 ${row[studentIdIndex]}:`, createError);
                                failureCount++;
                                errors.push(`創建學生資料 ${row[studentIdIndex]} 失敗`);
                                continue;
                            }
                        } else {
                            failureCount++;
                            const identifier = studentIdIndex !== -1 ? row[studentIdIndex] : row[studentNameIndex];
                            errors.push(`學生 ${identifier} 不存在且無法創建`);
                            continue;
                        }
                    }

                    // 檢查是否已經註冊
                    const existingEnrollment = await courseStudentModel.findOne({ courseId, studentId: student._id });
                    if (existingEnrollment) {
                        failureCount++;
                        errors.push(`學生 ${student.name} 已經註冊此課程`);
                        continue;
                    }

                    // 創建註冊記錄
                    const enrollment = new courseStudentModel({
                        courseId,
                        studentId: student._id,
                        enrollmentDate: new Date()
                    });

                    await enrollment.save();
                    successCount++;

                } catch (error) {
                    logger.error(`Error importing student from row ${i}:`, error);
                    failureCount++;
                    errors.push(`第 ${i} 行數據匯入失敗`);
                }
            }

            response.body = {
                successCount,
                failureCount,
                errors,
                message: `成功匯入 ${successCount} 名學生，失敗 ${failureCount} 名`
            } as any;
            response.message = "CSV匯入完成";

        } catch (error) {
            logger.error('Error in importStudentsFromCSV:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 創建學生資料
     * @param studentData 學生資料
     * @returns 創建結果
     */
    public async createStudent(studentData: {
        studentId: string;
        name: string;
        department?: string;
        grade?: string;
        class?: string;
        email?: string;
    }): Promise<resp<Student | undefined>> {
        const response: resp<Student | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 檢查學號是否已存在
            const existingStudent = await studentModel.findOne({ studentId: studentData.studentId });
            if (existingStudent) {
                response.code = 400;
                response.message = "學號已存在";
                return response;
            }

            // 創建新學生資料
            const newStudent = new studentModel({
                studentId: studentData.studentId,
                name: studentData.name,
                department: studentData.department || '',
                grade: studentData.grade || '',
                class: studentData.class || '',
                email: studentData.email || `${studentData.studentId}@student.edu`,
                absences: 0
            });

            const savedStudent = await newStudent.save();
            response.body = savedStudent.toObject();
            response.message = "創建學生資料成功";

        } catch (error) {
            logger.error('Error creating student:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }
}
