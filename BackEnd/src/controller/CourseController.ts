import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { CourseService } from "../Service/CourseService";

export class CourseController extends Contorller {
    protected service: CourseService;

    constructor() {
        super();
        this.service = new CourseService();
    }

    /**
     * 獲取所有課程
     */
    public async getAllCourses(req: Request, res: Response) {
        const response = await this.service.getAllCourses();
        res.status(response.code).send(response);
    }

    /**
     * 根據 ID 獲取課程
     */
    public async getCourseById(req: Request, res: Response) {
        const { courseId } = req.params;
        const response = await this.service.getCourseById(courseId);
        res.status(response.code).send(response);
    }

    /**
     * 創建新課程
     */
    public async createCourse(req: Request, res: Response) {
        const response = await this.service.createCourse(req.body);
        res.status(response.code).send(response);
    }

    /**
     * 更新課程
     */
    public async updateCourse(req: Request, res: Response) {
        const { courseId } = req.params;
        const response = await this.service.updateCourse(courseId, req.body);
        res.status(response.code).send(response);
    }

    /**
     * 刪除課程
     */
    public async deleteCourse(req: Request, res: Response) {
        const { courseId } = req.params;
        const response = await this.service.deleteCourse(courseId);
        res.status(response.code).send(response);
    }
}
