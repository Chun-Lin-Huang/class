import { Route } from "../abstract/Route";
import { CourseController } from "../controller/CourseController";

export class CourseRoute extends Route {
    protected url: string;
    protected Contorller = new CourseController();

    constructor() {
        super();
        this.url = '/api/v1/courses/';
        this.setRoutes();
    }

    protected setRoutes(): void {
        // 獲取所有課程（公開，不需要認證）
        this.router.get(`${this.url}`, (req, res) => {
            this.Contorller.getAllCourses(req, res);
        });

        // 根據 ID 獲取課程
        this.router.get(`${this.url}:courseId`, (req, res) => {
            this.Contorller.getCourseById(req, res);
        });

        // 創建新課程
        this.router.post(`${this.url}`, (req, res) => {
            this.Contorller.createCourse(req, res);
        });

        // 更新課程
        this.router.patch(`${this.url}:courseId`, (req, res) => {
            this.Contorller.updateCourse(req, res);
        });

        // 刪除課程
        this.router.delete(`${this.url}:courseId`, (req, res) => {
            this.Contorller.deleteCourse(req, res);
        });
    }
}
