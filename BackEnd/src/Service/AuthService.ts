import { Service } from "../abstract/Service";
import { User, LoginRequest, AuthResponse, StudentInfo } from "../interfaces/User";
import { userModel } from "../orm/schemas/userSchemas";
import { resp } from "../utils/resp";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logger } from "../middlewares/log";

export class AuthService extends Service {

    /**
     * 用戶註冊
     */
    public async register(userData: {
        userName: string,
        password: string,
        role: 'student' | 'admin',
        email?: string,
        studentInfo?: StudentInfo
    }): Promise<resp<AuthResponse | undefined>> {
        const response: resp<AuthResponse | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            logger.info('Registration attempt:', { 
                userName: userData.userName, 
                role: userData.role, 
                hasStudentInfo: !!userData.studentInfo 
            });
            // 檢查用戶是否已存在
            const existingUser = await userModel.findOne({ userName: userData.userName });
            if (existingUser) {
                response.code = 400;
                response.message = "用戶名已存在";
                return response;
            }

            // 加密密碼
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // 創建新用戶
            const userDoc: any = {
                userName: userData.userName,
                password: hashedPassword,
                role: userData.role
            };

            // 只有學生角色才需要學生資訊
            if (userData.role === 'student' && userData.studentInfo) {
                userDoc.studentInfo = userData.studentInfo;
                logger.info('Adding studentInfo for student:', userData.studentInfo);
            } else {
                logger.info('No studentInfo for role:', userData.role);
            }

            logger.info('Creating user with data:', userDoc);
            const newUser = new userModel(userDoc);

            const savedUser = await newUser.save();

            // 生成 JWT token
            const token = jwt.sign(
                { userId: savedUser._id, role: savedUser.role },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            response.body = {
                token,
                user: {
                    _id: savedUser._id.toString(),
                    userName: savedUser.userName,
                    role: savedUser.role,
                    studentInfo: savedUser.studentInfo
                }
            };
            response.message = "註冊成功";

        } catch (error) {
            logger.error('Registration error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 用戶登入
     */
    public async login(loginData: LoginRequest): Promise<resp<AuthResponse | undefined>> {
        const response: resp<AuthResponse | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 查找用戶
            const user = await userModel.findOne({ userName: loginData.userName });
            if (!user) {
                response.code = 401;
                response.message = "用戶名或密碼錯誤";
                return response;
            }

            // 驗證密碼
            const isValidPassword = await bcrypt.compare(loginData.password, user.password);
            if (!isValidPassword) {
                response.code = 401;
                response.message = "用戶名或密碼錯誤";
                return response;
            }

            // 生成 JWT token
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            response.body = {
                token,
                user: {
                    _id: user._id.toString(),
                    userName: user.userName,
                    role: user.role,
                    studentInfo: user.studentInfo
                }
            };
            response.message = "登入成功";

        } catch (error) {
            logger.error('Login error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 獲取用戶資訊
     */
    public async getUserInfo(userId: string): Promise<resp<User | undefined>> {
        const response: resp<User | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const user = await userModel.findById(userId).select('-password');
            if (!user) {
                response.code = 404;
                response.message = "用戶不存在";
                return response;
            }

            response.body = user;
            response.message = "獲取用戶資訊成功";

        } catch (error) {
            logger.error('Get user info error:', error);
            response.code = 500;
            response.message = "伺服器錯誤";
        }

        return response;
    }

    /**
     * 從 token 獲取用戶資訊
     */
    public async getUserInfoFromToken(token: string): Promise<resp<User | undefined>> {
        const response: resp<User | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            // 驗證並解碼 token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
            const userId = decoded.userId;

            const user = await userModel.findById(userId).select('-password');
            if (!user) {
                response.code = 404;
                response.message = "用戶不存在";
                return response;
            }

            response.body = user;
            response.message = "獲取用戶資訊成功";

        } catch (error) {
            logger.error('Token validation error:', error);
            response.code = 401;
            response.message = "Token 無效或已過期";
        }

        return response;
    }
}
