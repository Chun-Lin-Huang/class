import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { AttendanceService } from "../Service/AttendanceService";

export class AttendanceController extends Contorller {
    protected service: AttendanceService;

    constructor() {
        super();
        this.service = new AttendanceService();
    }

    /**
     * 開始點名（管理員功能）
     */
    public async startAttendanceSession(req: Request, res: Response) {
        const { courseId, sessionDate, attendanceMode } = req.body;
        const response = await this.service.startAttendanceSession(courseId, new Date(sessionDate), attendanceMode);
        res.status(response.code).send(response);
    }

    /**
     * 結束點名會話（管理員功能）
     */
    public async endAttendanceSession(req: Request, res: Response) {
        const { sessionId } = req.params;
        const response = await this.service.endAttendanceSession(sessionId);
        res.status(response.code).send(response);
    }

    /**
     * 學生點名
     */
    public async checkIn(req: Request, res: Response) {
        const { attendanceCode } = req.body;
        const studentId = req.user?._id;
        
        if (!studentId) {
            return res.status(401).json({ code: 401, message: "未授權", body: null });
        }

        const response = await this.service.checkIn(studentId, attendanceCode);
        res.status(response.code).send(response);
    }

    /**
     * 獲取學生的點名記錄
     */
    public async getStudentAttendance(req: Request, res: Response) {
        const studentId = req.user?._id;
        const { courseId } = req.query;
        
        if (!studentId) {
            return res.status(401).json({ code: 401, message: "未授權", body: null });
        }

        const response = await this.service.getStudentAttendance(
            studentId, 
            courseId as string
        );
        res.status(response.code).send(response);
    }

    /**
     * 獲取課程的點名統計（管理員功能）
     */
    public async getCourseAttendanceStats(req: Request, res: Response) {
        const { courseId } = req.params;
        const { sessionId } = req.query;
        
        const response = await this.service.getCourseAttendanceStats(
            courseId, 
            sessionId as string
        );
        res.status(response.code).send(response);
    }

    /**
     * 獲取活躍的點名會話（管理員功能）
     */
    public async getActiveSessions(req: Request, res: Response) {
        const response = await this.service.getActiveSessions();
        res.status(response.code).send(response);
    }

    /**
     * 獲取所有點名會話（包括已結束的）
     */
    public async getAllSessions(req: Request, res: Response) {
        const response = await this.service.getAllSessions();
        res.status(response.code).send(response);
    }

    /**
     * 獲取課程學生列表（用於手動點名）
     */
    public async getCourseStudents(req: Request, res: Response) {
        const { courseId } = req.params;
        const response = await this.service.getCourseStudentsForAttendance(courseId);
        res.status(response.code).send(response);
    }

    /**
     * 手動標記學生出席
     */
    public async manualAttendance(req: Request, res: Response) {
        const { sessionId, studentId, status } = req.body;
        const response = await this.service.manualAttendance(sessionId, studentId, status);
        res.status(response.code).send(response);
    }

    /**
     * 更新學生出席狀態（用於編輯點名紀錄）
     */
    public async updateAttendanceStatus(req: Request, res: Response) {
        const { sessionId, studentId, newStatus, notes } = req.body;
        const response = await this.service.updateAttendanceStatus(sessionId, studentId, newStatus, notes);
        res.status(response.code).send(response);
    }

    /**
     * 匯出課程點名紀錄為 Excel
     */
    public async exportAttendanceToExcel(req: Request, res: Response) {
        const { courseId } = req.params;
        
        try {
            const response = await this.service.exportAttendanceToExcel(courseId);
            
            if (response.code === 200 && response.body) {
                const { buffer, filename } = response.body;
                
                // 設定檔案下載的 headers
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
                res.setHeader('Content-Length', buffer.length);
                
                // 發送檔案
                res.send(buffer);
            } else {
                res.status(response.code).send(response);
            }
        } catch (error) {
            console.error('Export Excel error:', error);
            res.status(500).send({
                code: 500,
                message: '匯出失敗',
                body: undefined
            });
        }
    }

    /**
     * 隨機抽點功能
     */
    public async randomSelection(req: Request, res: Response) {
        const { courseId } = req.params;
        const { date } = req.query;
        
        try {
            const response = await this.service.randomSelection(courseId, date as string);
            res.status(response.code).send(response);
        } catch (error) {
            console.error('Random selection error:', error);
            res.status(500).send({
                code: 500,
                message: '隨機抽點失敗',
                body: undefined
            });
        }
    }
}
