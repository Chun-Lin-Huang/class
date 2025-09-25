import { Service } from "../abstract/Service";
import { Attendance, AttendanceSession, Course } from "../interfaces/Course";
import { attendanceModel, attendanceSessionModel, courseModel } from "../orm/schemas/courseSchemas";
import { resp } from "../utils/resp";
import { logger } from "../middlewares/log";

export class AttendanceService extends Service {

    /**
     * 開始點名（管理員功能）
     */
    public async startAttendanceSession(courseId: string, sessionDate: Date, attendanceMode: string = 'code'): Promise<resp<AttendanceSession | undefined>> {
        const response: resp<AttendanceSession | undefined> = {
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

            // 根據點名方式生成代碼
            let sessionCode: string;
            if (attendanceMode === 'manual') {
                // 為手動點名生成唯一代碼
                sessionCode = 'MANUAL_' + Date.now();
            } else {
                // 為代碼點名生成6位隨機數字
                sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
            }

            // 創建點名會話
            const session = new attendanceSessionModel({
                courseId,
                courseName: course.courseName,
                sessionCode,
                startTime: new Date(),
                status: 'active',
                attendedStudents: [],
                absentStudents: []
            });

            const savedSession = await session.save();
            response.body = savedSession;
            response.message = "點名會話已開始";

        } catch (error) {
            logger.error('Start attendance session error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 結束點名會話（管理員功能）
     */
    public async endAttendanceSession(sessionId: string): Promise<resp<AttendanceSession | undefined>> {
        const response: resp<AttendanceSession | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const session = await attendanceSessionModel.findByIdAndUpdate(
                sessionId,
                { 
                    status: 'ended', 
                    endTime: new Date(),
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!session) {
                response.code = 404;
                response.message = "點名會話不存在";
                return response;
            }

            response.body = session;
            response.message = "點名會話已結束";

        } catch (error) {
            logger.error('End attendance session error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 學生點名
     */
    public async checkIn(studentId: string, attendanceCode: string): Promise<resp<Attendance | undefined>> {
        const response: resp<Attendance | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 查找有效的點名會話
            const session = await attendanceSessionModel.findOne({
                attendanceCode,
                isActive: true
            });

            if (!session) {
                response.code = 400;
                response.message = "點名碼無效或已過期";
                return response;
            }

            // 檢查是否已經點名過
            const existingAttendance = await attendanceModel.findOne({
                courseId: session.courseId,
                studentId,
                attendanceDate: {
                    $gte: new Date(session.startTime.getFullYear(), session.startTime.getMonth(), session.startTime.getDate()),
                    $lt: new Date(session.startTime.getFullYear(), session.startTime.getMonth(), session.startTime.getDate() + 1)
                }
            });

            if (existingAttendance) {
                response.code = 400;
                response.message = "您已經點名過了";
                return response;
            }

            // 創建點名記錄
            const attendance = new attendanceModel({
                courseId: session.courseId,
                studentId,
                attendanceDate: session.startTime,
                status: 'present',
                checkInTime: new Date()
            });

            const savedAttendance = await attendance.save();
            response.body = savedAttendance;
            response.message = "點名成功";

        } catch (error) {
            logger.error('Check in error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 獲取學生的點名記錄
     */
    public async getStudentAttendance(studentId: string, courseId?: string): Promise<resp<Attendance[] | undefined>> {
        const response: resp<Attendance[] | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const filter: any = { studentId };
            if (courseId) {
                filter.courseId = courseId;
            }

            const attendances = await attendanceModel.find(filter).sort({ attendanceDate: -1 });
            response.body = attendances;
            response.message = "獲取點名記錄成功";

        } catch (error) {
            logger.error('Get student attendance error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 獲取課程的點名統計（管理員功能）
     */
    public async getCourseAttendanceStats(courseId: string, sessionId?: string): Promise<resp<any | undefined>> {
        const response: resp<any | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            let filter: any = { courseId };
            if (sessionId) {
                const session = await attendanceSessionModel.findById(sessionId);
                if (session) {
                    filter.attendanceDate = {
                        $gte: new Date(session.startTime.getFullYear(), session.startTime.getMonth(), session.startTime.getDate()),
                        $lt: new Date(session.startTime.getFullYear(), session.startTime.getMonth(), session.startTime.getDate() + 1)
                    };
                }
            }

            const stats = await attendanceModel.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            response.body = {
                total: stats.reduce((sum, stat) => sum + stat.count, 0),
                present: stats.find(s => s._id === 'present')?.count || 0,
                absent: stats.find(s => s._id === 'absent')?.count || 0,
                late: stats.find(s => s._id === 'late')?.count || 0
            };
            response.message = "獲取統計資料成功";

        } catch (error) {
            logger.error('Get course attendance stats error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 獲取活躍的點名會話
     * @returns 活躍點名會話列表
     */
    public async getActiveSessions(): Promise<resp<any[] | undefined>> {
        const response: resp<any[] | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const activeSessions = await attendanceSessionModel
                .find({ status: 'active' })
                .populate('courseId', 'courseName courseCode')
                .sort({ startTime: -1 });

            // 為每個會話添加點名人數
            const sessionsWithCount = activeSessions.map(session => ({
                ...session.toObject(),
                attendanceCount: session.attendedStudents ? session.attendedStudents.length : 0
            }));

            response.body = sessionsWithCount;
            response.message = "獲取活躍點名會話成功";

        } catch (error) {
            logger.error('Error getting active sessions:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 獲取所有點名會話（包括已結束的）
     * @returns 所有點名會話列表
     */
    public async getAllSessions(): Promise<resp<any[] | undefined>> {
        const response: resp<any[] | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const allSessions = await attendanceSessionModel
                .find({})
                .sort({ startTime: -1 });

            // 為每個會話添加點名人數
            const sessionsWithCount = allSessions.map(session => ({
                ...session.toObject(),
                attendanceCount: session.attendedStudents ? session.attendedStudents.length : 0
            }));

            response.body = sessionsWithCount;
            response.message = "獲取所有點名會話成功";

        } catch (error) {
            logger.error('Error getting all sessions:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 獲取課程學生列表（用於手動點名）
     */
    public async getCourseStudentsForAttendance(courseId: string): Promise<resp<any[] | undefined>> {
        const response: resp<any[] | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 從 CourseStudentService 獲取課程學生
            const { CourseStudentService } = await import('./CourseStudentService');
            const courseStudentService = new CourseStudentService();
            const courseStudentsResponse = await courseStudentService.getCourseStudents(courseId);

            if (courseStudentsResponse.code === 200 && courseStudentsResponse.body) {
                response.body = courseStudentsResponse.body;
                response.message = "獲取課程學生列表成功";
            } else {
                response.code = courseStudentsResponse.code;
                response.message = courseStudentsResponse.message;
            }

        } catch (error) {
            logger.error('Get course students for attendance error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 手動標記學生出席
     */
    public async manualAttendance(sessionId: string, studentId: string, status: 'present' | 'absent'): Promise<resp<any>> {
        const response: resp<any> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 查找點名會話
            const session = await attendanceSessionModel.findById(sessionId);
            if (!session) {
                response.code = 404;
                response.message = "點名會話不存在";
                return response;
            }

            // 查找學生信息
            const { studentModel } = await import('../orm/schemas/studentSchemas');
            const student = await studentModel.findById(studentId);
            if (!student) {
                response.code = 404;
                response.message = "學生不存在";
                return response;
            }

            // 確保數組存在
            if (!session.attendedStudents) session.attendedStudents = [];
            if (!session.absentStudents) session.absentStudents = [];

            // 檢查是否已經標記過
            const existingRecord = session.attendedStudents.find(s => s.studentId === studentId) ||
                                 session.absentStudents.find(s => s.studentId === studentId);

            if (existingRecord) {
                // 更新現有記錄
                if (status === 'present') {
                    // 從缺席列表移除，添加到出席列表
                    session.absentStudents = session.absentStudents.filter(s => s.studentId !== studentId);
                    session.attendedStudents.push({
                        studentId: student.studentId,
                        userName: student.name,
                        checkInTime: new Date()
                    });
                } else {
                    // 從出席列表移除，添加到缺席列表
                    session.attendedStudents = session.attendedStudents.filter(s => s.studentId !== studentId);
                    session.absentStudents.push({
                        studentId: student.studentId,
                        userName: student.name
                    });
                }
            } else {
                // 添加新記錄
                if (status === 'present') {
                    session.attendedStudents.push({
                        studentId: student.studentId,
                        userName: student.name,
                        checkInTime: new Date()
                    });
                } else {
                    session.absentStudents.push({
                        studentId: student.studentId,
                        userName: student.name
                    });
                }
            }

            await session.save();
            response.message = `學生 ${student.name} 已標記為${status === 'present' ? '出席' : '缺席'}`;

        } catch (error) {
            logger.error('Manual attendance error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 更新學生出席狀態（用於編輯點名紀錄）
     */
    public async updateAttendanceStatus(sessionId: string, studentId: string, newStatus: 'present' | 'absent' | 'excused'): Promise<resp<any>> {
        const response: resp<any> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 查找點名會話
            const session = await attendanceSessionModel.findById(sessionId);
            if (!session) {
                response.code = 404;
                response.message = "點名會話不存在";
                return response;
            }

            // 查找學生信息
            const { studentModel } = await import('../orm/schemas/studentSchemas');
            const student = await studentModel.findById(studentId);
            if (!student) {
                response.code = 404;
                response.message = "學生不存在";
                return response;
            }

            // 確保數組存在
            if (!session.attendedStudents) session.attendedStudents = [];
            if (!session.absentStudents) session.absentStudents = [];
            if (!session.excusedStudents) session.excusedStudents = [];

            // 從所有列表中移除學生
            session.attendedStudents = session.attendedStudents.filter(s => s.studentId !== student.studentId);
            session.absentStudents = session.absentStudents.filter(s => s.studentId !== student.studentId);
            session.excusedStudents = session.excusedStudents.filter(s => s.studentId !== student.studentId);

            // 根據新狀態添加到對應列表
            if (newStatus === 'present') {
                session.attendedStudents.push({
                    studentId: student.studentId,
                    userName: student.name,
                    checkInTime: new Date()
                });
            } else if (newStatus === 'absent') {
                session.absentStudents.push({
                    studentId: student.studentId,
                    userName: student.name
                });
            } else if (newStatus === 'excused') {
                session.excusedStudents.push({
                    studentId: student.studentId,
                    userName: student.name
                });
            }

            await session.save();
            
            const statusText = newStatus === 'present' ? '出席' : newStatus === 'absent' ? '缺席' : '請假';
            response.message = `學生 ${student.name} 的狀態已更新為${statusText}`;

        } catch (error) {
            logger.error('Update attendance status error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }
}
