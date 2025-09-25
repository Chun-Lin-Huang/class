const mongoose = require('mongoose');

// 課程 Schema
const courseSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    courseCode: { type: String, required: true, unique: true },
    teacher: { type: String, required: true },
    semester: { type: String, required: true },
    schedule: {
        dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

async function initCourses() {
    try {
        // 連接資料庫
        await mongoose.connect('mongodb://chunlin:azsxdcfv123@127.0.0.1:27017/class');
        console.log('Connected to MongoDB');

        // 清除現有課程
        await Course.deleteMany({});
        console.log('Cleared existing courses');

        // 創建課程資料
        const courses = [
            {
                courseName: '資料結構',
                courseCode: 'CS101',
                teacher: '張老師',
                semester: '2024-1',
                schedule: {
                    dayOfWeek: 1, // 星期一
                    startTime: '09:00',
                    endTime: '11:00'
                },
                isActive: true
            },
            {
                courseName: '演算法設計',
                courseCode: 'CS102',
                teacher: '李老師',
                semester: '2024-1',
                schedule: {
                    dayOfWeek: 3, // 星期三
                    startTime: '14:00',
                    endTime: '16:00'
                },
                isActive: true
            },
            {
                courseName: '資料庫系統',
                courseCode: 'CS103',
                teacher: '王老師',
                semester: '2024-1',
                schedule: {
                    dayOfWeek: 5, // 星期五
                    startTime: '10:00',
                    endTime: '12:00'
                },
                isActive: true
            }
        ];

        for (const courseData of courses) {
            const course = new Course(courseData);
            await course.save();
            console.log(`Created course: ${courseData.courseName} (${courseData.courseCode})`);
        }

        console.log('All courses created successfully!');

    } catch (error) {
        console.error('Error initializing courses:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

initCourses();
