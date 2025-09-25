import { Route } from "../abstract/Route";
import { AttendanceController } from "../controller/AttendanceController";

export class AttendanceRoute extends Route {
    protected url: string;
    protected Contorller = new AttendanceController();

    constructor() {
        super();
        this.url = '/api/v1/attendance/';
        this.setRoutes();
    }

    protected setRoutes(): void {
        // 開始點名
        this.router.post(`${this.url}start-session`, (req, res) => {
            this.Contorller.startAttendanceSession(req, res);
        });

        // 結束點名會話
        this.router.post(`${this.url}end-session/:sessionId`, (req, res) => {
            this.Contorller.endAttendanceSession(req, res);
        });

        // 學生點名
        this.router.post(`${this.url}check-in`, (req, res) => {
            this.Contorller.checkIn(req, res);
        });

        // 獲取學生點名記錄
        this.router.get(`${this.url}student-records`, (req, res) => {
            this.Contorller.getStudentAttendance(req, res);
        });

        // 獲取課程點名統計
        this.router.get(`${this.url}course-stats/:courseId`, (req, res) => {
            this.Contorller.getCourseAttendanceStats(req, res);
        });

        // 獲取活躍的點名會話
        this.router.get(`${this.url}active-sessions`, (req, res) => {
            this.Contorller.getActiveSessions(req, res);
        });

        // 獲取所有點名會話（包括已結束的）
        this.router.get(`${this.url}all-sessions`, (req, res) => {
            this.Contorller.getAllSessions(req, res);
        });

        // 獲取課程學生列表（用於手動點名）
        this.router.get(`${this.url}course-students/:courseId`, (req, res) => {
            this.Contorller.getCourseStudents(req, res);
        });

        // 手動標記學生出席
        this.router.post(`${this.url}manual-attendance`, (req, res) => {
            this.Contorller.manualAttendance(req, res);
        });

        // 更新學生出席狀態（用於編輯點名紀錄）
        this.router.patch(`${this.url}update-attendance-status`, (req, res) => {
            this.Contorller.updateAttendanceStatus(req, res);
        });
    }
}
