import { Route } from "../abstract/Route";
import { CourseStudentController } from "../controller/CourseStudentController";

export class CourseStudentRoute extends Route {
    protected url: string;
    protected Contorller = new CourseStudentController();

    constructor() {
        super();
        this.url = '/api/v1/course-students';
        this.setRoutes();
    }

    protected setRoutes(): void {
        // 將學生加入課程
        this.router.post(`${this.url}/enroll`, (req, res) => {
            this.Contorller.enrollStudent(req, res);
        });

        // 批量匯入學生到課程
        this.router.post(`${this.url}/import`, (req, res) => {
            this.Contorller.importStudents(req, res);
        });

        // CSV匯入學生到課程
        this.router.post(`${this.url}/import-csv`, (req, res) => {
            this.Contorller.importStudentsFromCSV(req, res);
        });

        // 獲取課程的所有學生
        this.router.get(`${this.url}/course/:courseId`, (req, res) => {
            this.Contorller.getCourseStudents(req, res);
        });

        // 獲取所有學生（用於匯入選擇）
        this.router.get(`${this.url}/students`, (req, res) => {
            this.Contorller.getAllStudents(req, res);
        });

            // 從課程中移除學生
            this.router.delete(`${this.url}/course/:courseId/student/:studentId`, (req, res) => {
                this.Contorller.removeStudentFromCourse(req, res);
            });

            // 創建學生資料
            this.router.post(`${this.url}/create-student`, (req, res) => {
                this.Contorller.createStudent(req, res);
            });
    }
}
