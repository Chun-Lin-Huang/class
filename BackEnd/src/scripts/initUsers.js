const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 用戶 Schema
const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['student', 'admin'], 
        required: true,
        default: 'student'
    },
    studentInfo: {
        sid: { type: String, required: false },
        name: { type: String, required: false },
        department: { type: String, required: false },
        grade: { type: String, required: false },
        class: { type: String, required: false },
        email: { type: String, required: false },
        absences: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function initUsers() {
    try {
        // 連接資料庫
        await mongoose.connect('mongodb://chunlin:azsxdcfv123@127.0.0.1:27017/class');
        console.log('Connected to MongoDB');

        // 清除現有用戶
        await User.deleteMany({});
        console.log('Cleared existing users');

        // 創建管理員帳號
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            userName: 'admin',
            password: adminPassword,
            role: 'admin'
        });
        await admin.save();
        console.log('Created admin user: admin / admin123');

        // 創建學生帳號
        const studentPassword = await bcrypt.hash('student123', 10);
        const student = new User({
            userName: 'student001',
            password: studentPassword,
            role: 'student',
            studentInfo: {
                sid: '001',
                name: '張小明',
                department: '資訊工程',
                grade: '大三',
                class: 'A班',
                email: 'student001@example.com',
                absences: 0
            }
        });
        await student.save();
        console.log('Created student user: student001 / student123');

        // 創建更多學生帳號
        const students = [
            {
                userName: 'student002',
                password: 'student123',
                studentInfo: {
                    sid: '002',
                    name: '李小花',
                    department: '資訊工程',
                    grade: '大三',
                    class: 'A班',
                    email: 'student002@example.com',
                    absences: 1
                }
            },
            {
                userName: 'student003',
                password: 'student123',
                studentInfo: {
                    sid: '003',
                    name: '王大華',
                    department: '資訊工程',
                    grade: '大三',
                    class: 'B班',
                    email: 'student003@example.com',
                    absences: 0
                }
            }
        ];

        for (const studentData of students) {
            const hashedPassword = await bcrypt.hash(studentData.password, 10);
            const student = new User({
                userName: studentData.userName,
                password: hashedPassword,
                role: 'student',
                studentInfo: studentData.studentInfo
            });
            await student.save();
            console.log(`Created student user: ${studentData.userName} / ${studentData.password}`);
        }

        console.log('All users created successfully!');
        console.log('\n=== 測試帳號 ===');
        console.log('管理員: admin / admin123');
        console.log('學生1: student001 / student123');
        console.log('學生2: student002 / student123');
        console.log('學生3: student003 / student123');

    } catch (error) {
        console.error('Error initializing users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

initUsers();
