import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { CourseStudentService } from "../Service/CourseStudentService";
import { User } from "../interfaces/User";
import { logger } from "../middlewares/log";

interface AuthenticatedRequest extends Request {
    user?: User;
}

export class CourseStudentController extends Contorller {
    protected service: CourseStudentService;

    constructor() {
        super();
        this.service = new CourseStudentService();
    }

    /**
     * 將學生加入課程
     */
    public async enrollStudent(req: AuthenticatedRequest, res: Response) {
        const { courseId, studentId } = req.body;
        if (!courseId || !studentId) {
            return res.status(400).send({ code: 400, message: '缺少必要參數' });
        }

        const result = await this.service.enrollStudent(courseId, studentId);
        res.status(result.code).send(result);
    }

    /**
     * 批量匯入學生到課程
     */
    public async importStudents(req: AuthenticatedRequest, res: Response) {
        const { courseId, studentIds } = req.body;
        if (!courseId || !studentIds || !Array.isArray(studentIds)) {
            return res.status(400).send({ code: 400, message: '缺少必要參數或格式不正確' });
        }

        const result = await this.service.importStudents({ courseId, studentIds });
        res.status(result.code).send(result);
    }

    /**
     * CSV匯入學生到課程
     */
    public async importStudentsFromCSV(req: AuthenticatedRequest, res: Response) {
        const { courseId, csvData } = req.body;
        if (!courseId || !csvData) {
            return res.status(400).send({ code: 400, message: '缺少必要參數' });
        }

        const result = await this.service.importStudentsFromCSV(courseId, csvData);
        res.status(result.code).send(result);
    }

    /**
     * 獲取課程的所有學生
     */
    public async getCourseStudents(req: AuthenticatedRequest, res: Response) {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).send({ code: 400, message: '缺少課程ID' });
        }

        const result = await this.service.getCourseStudents(courseId);
        res.status(result.code).send(result);
    }

    /**
     * 獲取所有學生（用於匯入選擇）
     */
    public async getAllStudents(req: AuthenticatedRequest, res: Response) {
        const result = await this.service.getAllStudents();
        res.status(result.code).send(result);
    }

        /**
         * 從課程中移除學生
         */
        public async removeStudentFromCourse(req: AuthenticatedRequest, res: Response) {
            const { courseId, studentId } = req.params;
            if (!courseId || !studentId) {
                return res.status(400).send({ code: 400, message: '缺少必要參數' });
            }

            const result = await this.service.removeStudentFromCourse(courseId, studentId);
            res.status(result.code).send(result);
        }

        /**
         * 創建學生資料
         */
        public async createStudent(req: AuthenticatedRequest, res: Response) {
            const { studentId, name, department, grade, class: className, email } = req.body;
            if (!studentId || !name) {
                return res.status(400).send({ code: 400, message: '缺少必要參數' });
            }

            const result = await this.service.createStudent({
                studentId,
                name,
                department,
                grade,
                class: className,
                email
            });
            res.status(result.code).send(result);
        }
}
