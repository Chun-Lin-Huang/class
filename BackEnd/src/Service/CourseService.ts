import { Service } from "../abstract/Service";
import { Course } from "../interfaces/Course";
import { courseModel } from "../orm/schemas/courseSchemas";
import { resp } from "../utils/resp";
import { logger } from "../middlewares/log";

export class CourseService extends Service {

    /**
     * 獲取所有課程
     */
    public async getAllCourses(): Promise<resp<Course[] | undefined>> {
        const response: resp<Course[] | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const courses = await courseModel.find({ isActive: true }).sort({ courseName: 1 });
            response.body = courses;
            response.message = "獲取課程列表成功";

        } catch (error) {
            logger.error('Get all courses error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 根據 ID 獲取課程
     */
    public async getCourseById(courseId: string): Promise<resp<Course | undefined>> {
        const response: resp<Course | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const course = await courseModel.findById(courseId);
            if (!course) {
                response.code = 404;
                response.message = "課程不存在";
                return response;
            }

            response.body = course;
            response.message = "獲取課程成功";

        } catch (error) {
            logger.error('Get course by ID error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 創建新課程
     */
    public async createCourse(courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>): Promise<resp<Course | undefined>> {
        const response: resp<Course | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 為缺失的字段提供默認值
            const courseDataWithDefaults = {
                ...courseData,
                teacher: courseData.teacher || '未指定',
                semester: courseData.semester || '當前學期',
                isActive: courseData.isActive !== undefined ? courseData.isActive : true
            };

            const course = new courseModel(courseDataWithDefaults);
            const savedCourse = await course.save();
            
            response.body = savedCourse;
            response.message = "創建課程成功";

        } catch (error) {
            logger.error('Create course error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 更新課程
     */
    public async updateCourse(courseId: string, courseData: Partial<Omit<Course, '_id' | 'createdAt' | 'updatedAt'>>): Promise<resp<Course | undefined>> {
        const response: resp<Course | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const course = await courseModel.findByIdAndUpdate(
                courseId, 
                { ...courseData, updatedAt: new Date() }, 
                { new: true }
            );
            
            if (!course) {
                response.code = 404;
                response.message = "課程不存在";
                return response;
            }

            response.body = course;
            response.message = "更新課程成功";

        } catch (error) {
            logger.error('Update course error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 刪除課程
     */
    public async deleteCourse(courseId: string): Promise<resp<boolean | undefined>> {
        const response: resp<boolean | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const course = await courseModel.findByIdAndDelete(courseId);
            
            if (!course) {
                response.code = 404;
                response.message = "課程不存在";
                return response;
            }

            response.body = true;
            response.message = "刪除課程成功";

        } catch (error) {
            logger.error('Delete course error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }
}
