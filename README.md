# 課堂點名系統

這是一個基於 Node.js + React 的全端點名系統，支援學生和管理員兩種角色。

## 🚀 功能特色

### 學生功能
- 用戶註冊/登入
- 使用點名碼進行點名
- 查看個人點名記錄
- 查看出席狀態統計

### 管理員功能
- 用戶註冊/登入
- 開始/結束點名會話
- 生成點名碼
- 查看課程點名統計
- 管理學生資料

## 🛠 技術棧

### 後端
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT 認證
- bcryptjs 密碼加密

### 前端
- React 18
- TypeScript
- Vite
- React Router
- Context API

## 📦 安裝與運行

### 後端設定

1. 進入後端目錄
```bash
cd BackEnd
```

2. 安裝依賴
```bash
npm install
```

3. 設定環境變數
創建 `.env` 檔案並設定：
```env
DBUSER=your_db_username
DBPASSWORD=your_db_password
DBHOST=localhost
DBPORT=27017
DBNAME=attendance_system
JWT_SECRET=your_jwt_secret_key_here
PORT=8877
assetsPath=./public
HomePagePath=./public/index.html
```

4. 啟動後端
```bash
npm run dev
```

### 前端設定

1. 進入前端目錄
```bash
cd FrontEnd
```

2. 安裝依賴
```bash
npm install
```

3. 啟動前端
```bash
npm run dev
```

## 🔧 API 端點

### 認證相關
- `POST /api/v1/auth/register` - 用戶註冊
- `POST /api/v1/auth/login` - 用戶登入
- `GET /api/v1/auth/me` - 獲取用戶資訊

### 點名相關
- `POST /api/v1/attendance/check-in` - 學生點名
- `GET /api/v1/attendance/student-records` - 獲取學生點名記錄
- `POST /api/v1/attendance/start-session` - 開始點名（管理員）
- `POST /api/v1/attendance/end-session/:sessionId` - 結束點名（管理員）
- `GET /api/v1/attendance/course-stats/:courseId` - 獲取課程統計（管理員）

## 📱 使用流程

### 學生使用流程
1. 註冊帳號（選擇學生角色）
2. 填寫學生資訊
3. 登入系統
4. 輸入老師提供的點名碼進行點名
5. 查看個人點名記錄

### 管理員使用流程
1. 註冊帳號（選擇管理員角色）
2. 登入系統
3. 選擇課程開始點名
4. 系統生成點名碼
5. 學生使用點名碼點名
6. 結束點名會話
7. 查看點名統計

## 🔐 安全特性

- JWT Token 認證
- 密碼加密儲存
- 角色權限控制
- CORS 跨域保護
- 輸入驗證

## 📊 資料庫結構

### Users 集合
- 用戶基本資訊
- 角色權限
- 學生詳細資訊

### Courses 集合
- 課程資訊
- 上課時間
- 教師資訊

### Attendances 集合
- 點名記錄
- 出席狀態
- 時間戳記

### AttendanceSessions 集合
- 點名會話
- 點名碼
- 會話狀態

## 🎨 介面特色

- 響應式設計
- 現代化 UI
- 直觀的操作流程
- 即時狀態反饋
- 角色區分介面

## 🔄 系統架構

```
FrontEnd (React)
    ↓ HTTP/HTTPS
BackEnd (Express + Node.js)
    ↓ MongoDB Driver
MongoDB Database
```

## 📝 開發注意事項

1. 確保 MongoDB 服務正在運行
2. 設定正確的環境變數
3. 前後端需要同時運行
4. 點名碼為 6 位隨機數字
5. Token 有效期為 24 小時

## 🚀 部署建議

- 使用 PM2 管理 Node.js 進程
- 設定 Nginx 反向代理
- 使用 MongoDB Atlas 雲端資料庫
- 設定 SSL 憑證
- 定期備份資料庫

## 📞 支援

如有問題或建議，請聯繫開發團隊。
