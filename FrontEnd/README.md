# 課堂點名系統 - 前端

## 項目結構

```
src/
├── components/          # React 組件
│   ├── MainPage.tsx                    # 主頁面
│   ├── LoginForm.tsx                   # 登入表單
│   ├── AdminDashboard.tsx              # 管理員儀表板
│   ├── StudentDashboard.tsx            # 學生儀表板
│   ├── AttendanceManagementPage.tsx    # 點名管理頁面
│   ├── StudentManagementPage.tsx       # 學生管理頁面
│   ├── CourseManagementPage.tsx        # 課程管理頁面
│   ├── AttendanceRecordsPage.tsx       # 點名紀錄頁面
│   ├── CourseStudentManagement.tsx     # 課程學生管理組件
│   ├── ImportStudentsModal.tsx         # 匯入學生模態框
│   └── Toast.tsx                       # Toast 通知組件
├── contexts/           # React Context
│   └── AuthContext.tsx                 # 認證上下文
├── router/             # 路由管理
│   └── router.tsx                      # 統一路由配置
├── types/              # TypeScript 類型定義
│   ├── User.ts                         # 用戶相關類型
│   ├── Attendance.ts                   # 點名相關類型
│   ├── CourseStudent.ts                # 課程學生關係類型
│   ├── Student.ts                      # 學生相關類型
│   └── resp.ts                         # API 響應類型
├── utils/              # 工具函數
│   └── fetch.ts                        # API 請求工具
├── enum/               # 枚舉和常量
│   └── api.ts                          # API 端點定義
├── style/              # 樣式文件
│   ├── App.css                         # 主要樣式
│   └── index.css                       # 全局樣式
├── view/               # 視圖層
│   └── App.tsx                         # 根組件
└── main.tsx            # 應用入口
```

## 路由結構

- `/` - 主頁面（功能選單）
- `/attendance` - 點名管理（僅管理員）
- `/student-management` - 學生管理（僅管理員）
- `/student-management/:courseId` - 特定課程學生管理（僅管理員）
- `/course-management` - 課程管理（僅管理員）
- `/attendance-records` - 點名紀錄（所有用戶）
- `/admin` - 原管理員儀表板（僅管理員）
- `/student` - 原學生儀表板（僅學生）

## 主要功能

### 主頁面 (MainPage)
- 歡迎區域顯示用戶信息
- 四個主要功能模塊的導航卡片
- 根據用戶角色顯示不同功能

### 點名管理 (AttendanceManagementPage)
- 開始點名功能
- 查看進行中的點名會話
- 結束點名會話

### 學生管理 (StudentManagementPage)
- 選擇課程管理學生
- 匯入學生功能
- 移除學生功能

### 課程管理 (CourseManagementPage)
- 新增/編輯/刪除課程
- 課程列表顯示
- 課程詳細信息管理

### 點名紀錄 (AttendanceRecordsPage)
- 選擇課程查看紀錄
- 顯示出席率統計
- 詳細學生出席狀況

## 技術棧

- **React 18** - 前端框架
- **TypeScript** - 類型安全
- **React Router** - 路由管理
- **CSS3** - 樣式設計
- **Vite** - 構建工具

## 開發命令

```bash
# 安裝依賴
npm install

# 開發服務器
npm run dev

# 構建生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 設計特色

- **現代化UI**：漸層背景、卡片式設計、懸停效果
- **響應式設計**：適配各種螢幕尺寸
- **角色權限**：根據用戶角色顯示不同功能
- **直觀導航**：清晰的返回按鈕和麵包屑導航
- **Toast通知**：統一的成功/錯誤訊息顯示