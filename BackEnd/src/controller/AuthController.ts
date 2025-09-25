import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { AuthService } from "../Service/AuthService";
import { LoginRequest } from "../interfaces/User";

export class AuthController extends Contorller {
    protected service: AuthService;

    constructor() {
        super();
        this.service = new AuthService();
    }

    /**
     * 用戶註冊
     */
    public async register(req: Request, res: Response) {
        const response = await this.service.register(req.body);
        res.status(response.code).send(response);
    }

    /**
     * 用戶登入
     */
    public async login(req: Request, res: Response) {
        const loginData: LoginRequest = req.body;
        const response = await this.service.login(loginData);
        res.status(response.code).send(response);
    }

    /**
     * 獲取用戶資訊
     */
    public async getUserInfo(req: Request, res: Response) {
        // 從 Authorization header 中獲取 token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ code: 401, message: "未授權", body: null });
        }
        
        const token = authHeader.substring(7); // 移除 "Bearer " 前綴
        const response = await this.service.getUserInfoFromToken(token);
        res.status(response.code).send(response);
    }
}
