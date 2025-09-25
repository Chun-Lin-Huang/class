import { Route } from "../abstract/Route";
import { AuthController } from "../controller/AuthController";

export class AuthRoute extends Route {
    protected url: string;
    protected Contorller = new AuthController();

    constructor() {
        super();
        this.url = '/api/v1/auth/';
        this.setRoutes();
    }

    protected setRoutes(): void {
        // 註冊
        this.router.post(`${this.url}register`, (req, res) => {
            this.Contorller.register(req, res);
        });

        // 登入
        this.router.post(`${this.url}login`, (req, res) => {
            this.Contorller.login(req, res);
        });

        // 獲取用戶資訊
        this.router.get(`${this.url}me`, (req, res) => {
            this.Contorller.getUserInfo(req, res);
        });
    }
}
