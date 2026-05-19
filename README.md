# SaaSHub — All-in-One SaaS Project Management

<div align="center">

**Nền tảng quản lý dự án phần mềm tích hợp — Kanban Board, GitHub Integration, Real-time Reports**

![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=nodedotjs)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Express](https://img.shields.io/badge/Express-4-black?logo=express)

</div>

> **Live Demo**: [SaaSHub Demo](https://saashub-demo.example.com) *(Demo placeholder)*

![SaaSHub Dashboard Screenshot](https://via.placeholder.com/1200x600?text=SaaSHub+Dashboard+Screenshot)

## 🔥 Điểm nổi bật
- **Kanban Optimistic Updates**: Kéo thả mượt mà với rollback tự động, mang lại trải nghiệm không độ trễ.
- **GitHub Webhook Automation**: Tự động chuyển trạng thái task khi developer commit hoặc merge code có chứa ID task (ví dụ: `#MOB-091`).

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Kiến trúc](#-kiến-trúc)
- [Cài đặt](#-cài-đặt)
- [MongoDB Guide](#-mongodb-guide)
- [API Documentation](#-api-documentation)
- [GitHub Integration](#-github-integration)
- [Bảo mật](#-bảo-mật)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

---

## 🌟 Tổng quan

SaaSHub là nền tảng quản lý dự án phần mềm giống **Jira/Trello** nhưng tích hợp sâu với GitHub. Hệ thống giúp team phát triển phần mềm:

- **Quản lý task** bằng Kanban board kéo thả
- **Tự động cập nhật** trạng thái task khi developer commit code
- **Báo cáo real-time** với biểu đồ sprint velocity, team performance
- **Bảo mật enterprise-grade** với JWT refresh tokens, rate limiting, HMAC webhook verification

### Ai dùng hệ thống này?

| Vai trò | Dùng SaaSHub để... |
|:---|:---|
| **Project Manager** | Lên kế hoạch sprint, theo dõi tiến độ, phát hiện task trễ |
| **Tech Lead** | Phân công task, review code flow, kiểm soát workload team |
| **Developer** | Nhận task, cập nhật trạng thái, liên kết code với task |
| **CEO/Stakeholder** | Xem báo cáo tổng quan, so sánh hiệu suất |

---

## ✨ Tính năng

### 🔐 Authentication & Security
- JWT Access Token (30 phút) + Refresh Token (7 ngày) với rotation
- Rate limiting: 5 lần login sai → lock 15 phút
- Helmet.js security headers
- CORS whitelist
- Input validation (express-validator)
- Authorization/ownership checks
- GitHub webhook HMAC-SHA256 signature verification

### 📊 Dashboard
- 4 stat cards: Tổng tasks, Hoàn thành, Đang thực hiện, Quá hạn
- Sprint Burndown chart (ideal vs actual)
- Task distribution pie chart

### 📋 Kanban Board
- 4 cột: Backlog → In Progress → In Review → Done
- Drag & drop (dnd-kit)
- Optimistic updates với rollback khi lỗi
- Create task modal
- Delete với confirmation dialog

### 🐙 GitHub Activity
- Real-time commit feed
- Author commit stats
- Auto task status update on commit/PR
- Linked task badges

### 📈 Reports
- Sprint velocity comparison
- Team performance (horizontal bars)
- Task status distribution
- Summary cards

### 👥 Team Management
- Member workload view
- Workload level indicators (Ít / Vừa / Nhiều / Quá tải)
- Invite member placeholder

### ⚙️ Settings
- Project info
- GitHub webhook setup guide
- Dark mode toggle (Light / Dark / System)

### 🎨 UX Features
- Skeleton loaders trên tất cả pages
- Toast notifications (react-hot-toast)
- Confirmation dialog cho destructive actions
- Empty states với hướng dẫn
- 404 page đẹp
- Responsive (Desktop / Tablet / Mobile)
- Dark mode via CSS Variables

---

## 🛠 Tech Stack

| Layer | Technology | Lý do |
|:---|:---|:---|
| Frontend | Vite + React 18 | Nhanh, HMR, ecosystem lớn |
| Drag & Drop | @dnd-kit/core + sortable | Modern, performant |
| Charts | Recharts | React-native SVG charts |
| Routing | React Router v6 | Chuẩn routing |
| Auth | JWT + bcryptjs | Stateless, scalable |
| HTTP Client | Axios | Interceptors cho auto-refresh |
| Backend | Express.js | Lightweight, flexible |
| Database | MongoDB Atlas + Mongoose | Cloud, flexible schema |
| Security | helmet, express-rate-limit, express-validator | Defense in depth |
| Styling | Vanilla CSS + CSS Variables | Maximum control |
| Icons | Lucide React | Modern, lightweight |
| Font | Inter (Google Fonts) | Premium typography |
| Toast | react-hot-toast | Minimal, customizable |

---

## 🏗 Kiến trúc

```
┌──────────────────────────┐
│     Frontend (Vite)      │
│   React + React Router   │
│   Axios + JWT auto-      │
│   refresh interceptor    │
│          :5173            │
└──────────┬───────────────┘
           │ /api/*
┌──────────▼───────────────┐
│    Backend (Express)     │
│  ┌─────────────────────┐ │
│  │ Helmet │ CORS │ Rate│ │
│  │ Limit  │ Morgan     │ │
│  └─────────────────────┘ │
│  ┌─────────────────────┐ │
│  │ JWT Auth Middleware  │ │
│  │ Authorization Check  │ │
│  │ Input Validation     │ │
│  └─────────────────────┘ │
│  Routes → Controllers    │
│          :5000            │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│    MongoDB Atlas          │
│  Users, Projects, Tasks,  │
│  Activities, RefreshTokens│
└──────────────────────────┘
```

---

## 🚀 Cài đặt

Cách nhanh nhất để chạy SaaSHub là sử dụng **Docker**.

### Cách 1: Chạy bằng Docker (Khuyên dùng)
Yêu cầu: Đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. Clone repository:
   ```bash
   git clone https://github.com/yourusername/SaaSHub-Project-Management.git
   cd SaaSHub-Project-Management
   ```
2. Khởi chạy toàn bộ hệ thống (MongoDB, Server, Client):
   ```bash
   docker-compose up -d --build
   ```
3. Truy cập trình duyệt: **http://localhost**

*(Lưu ý: Bạn có thể cần chạy lệnh seed data bên trong container backend nếu muốn có dữ liệu mẫu).*

---

### Cách 2: Cài đặt thủ công (Dành cho Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (hoặc local MongoDB)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Cấu hình MongoDB

1. Tạo tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster (Free tier M0)
3. Tạo Database User
4. Whitelist IP (0.0.0.0/0 cho development)
5. Lấy connection string

### 3. Environment Variables

Copy `.env.example` → `server/.env` và cập nhật:

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster.mongodb.net/saashub
JWT_SECRET=your_strong_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Seed Database

```bash
cd server
npm run seed
```

Output:
```
🌱 Seeding database...
✅ Created 5 users
✅ Created 3 projects
✅ Created 128 tasks
✅ Created 60 activities
🎉 Seed completed!
📧 Login credentials:
   nva@saashub.com / password123
   ptb@saashub.com / password123
   lac@saashub.com / password123
   mqd@saashub.com / password123
   the@saashub.com / password123
```

### 5. Chạy Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

---

## 📖 MongoDB Guide

### MongoDB là gì?

MongoDB là **NoSQL database** lưu trữ dữ liệu dạng **JSON-like documents** thay vì bảng (tables) như SQL.

### Document vs Table

| SQL (MySQL/PostgreSQL) | MongoDB |
|:---|:---|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| JOIN | Populate / Aggregation |

### Schema Design trong SaaSHub

```javascript
// Task document
{
  _id: ObjectId("..."),     // Auto-generated unique ID
  taskId: "MOB-091",        // Human-readable ID
  title: "Implement OAuth",
  status: "in_progress",    // Enum validation
  assignee: ObjectId("..."),// Reference to User
  project: ObjectId("..."), // Reference to Project
  commits: [{               // Embedded array
    sha: "e1b2c3d",
    message: "feat: add auth"
  }],
  deletedAt: null           // Soft delete pattern
}
```

### Key Patterns Used

1. **Embedding** (commits in Task) — data accessed together
2. **Referencing** (assignee → User) — data shared across entities
3. **Soft Delete** (deletedAt field) — undo support
4. **TTL Index** (RefreshToken) — auto-cleanup expired tokens
5. **Compound Index** (project + status + order) — fast Kanban queries

---

## 📡 API Documentation

### Auth Endpoints

| Method | Endpoint | Auth | Rate Limited | Description |
|:---|:---|:---|:---|:---|
| POST | `/api/auth/register` | ❌ | ❌ | Đăng ký |
| POST | `/api/auth/login` | ❌ | ✅ 5/15min | Đăng nhập |
| POST | `/api/auth/refresh` | ❌ | ❌ | Refresh token |
| POST | `/api/auth/logout` | ❌ | ❌ | Revoke token |
| GET | `/api/auth/me` | ✅ | ❌ | Current user |

### Task Endpoints

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| GET | `/api/tasks?project=&cursor=&limit=` | ✅ | List with pagination |
| GET | `/api/tasks/stats?project=` | ✅ | Task statistics |
| POST | `/api/tasks` | ✅ | Create task |
| PUT | `/api/tasks/:id` | ✅ | Update task |
| PUT | `/api/tasks/reorder` | ✅ | Reorder (drag-drop) |
| DELETE | `/api/tasks/:id` | ✅ | Soft delete |
| POST | `/api/tasks/:id/restore` | ✅ | Undo delete |

### Other Endpoints

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| GET | `/api/projects` | ✅ | List projects (member-scoped) |
| GET | `/api/projects/:id/stats` | ✅ | Project dashboard stats |
| GET | `/api/projects/:id/burndown` | ✅ | Burndown chart data |
| GET | `/api/users` | ✅ | List users |
| GET | `/api/users/workload` | ✅ | Team workload stats |
| GET | `/api/activities` | ✅ | Activity feed |
| POST | `/api/webhooks/github` | HMAC | GitHub webhook |

---

## 🐙 GitHub Integration

### Setup Webhook

1. GitHub repo → **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `https://your-server.com/api/webhooks/github`
3. **Content type**: `application/json`
4. **Secret**: giá trị `GITHUB_WEBHOOK_SECRET` từ `.env`
5. Events: **Push** và **Pull requests**

### Auto Status Update

Khi commit message chứa task ID (format `#TASK-XXX`):

```
git commit -m "feat: add auth flow #MOB-091"
```

→ SaaSHub tự động:
- Thêm commit vào task MOB-091
- Chuyển status: backlog → in_progress

Khi PR merged → task status → **done** (progress 100%)

---

## 🔒 Bảo mật

| Feature | Implementation |
|:---|:---|
| Password Hashing | bcrypt (12 rounds) |
| JWT Access Token | 30 min expiry |
| JWT Refresh Token | 7 day expiry, rotation, revocation |
| Token Reuse Detection | Revoke all sessions if reuse detected |
| Rate Limiting | 5 login attempts / 15 min |
| Webhook Verification | HMAC-SHA256 (timing-safe compare) |
| Security Headers | Helmet.js (~12 headers) |
| CORS | Whitelist only client origin |
| Input Validation | express-validator on all routes |
| Authorization | Ownership + role-based checks |
| Soft Delete | deletedAt pattern (undo support) |
| Password Protection | `select: false` on User schema |
| Error Handling | Never expose stack traces to client |

---

## 📁 Cấu trúc thư mục

```
SaaSHub-Project-Management/
├── client/                          # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/              # Sidebar
│   │   │   ├── Kanban/              # Board, Column, Card, CreateModal
│   │   │   └── common/              # ConfirmDialog, EmptyState, Skeleton
│   │   ├── contexts/                # AuthContext, ProjectContext
│   │   ├── pages/                   # 7 page components + 404
│   │   ├── services/                # API (Axios + interceptors)
│   │   ├── App.jsx                  # Router + Providers
│   │   ├── index.css                # Design system
│   │   └── main.jsx
│   └── vite.config.js               # Proxy /api → :5000
│
├── server/                          # Backend (Express)
│   ├── config/db.js                 # MongoDB connection
│   ├── controllers/                 # Auth, Task, Project, User, Activity, Webhook
│   ├── middleware/                   # auth, authorize, validate
│   ├── models/                      # User, RefreshToken, Project, Task, Activity
│   ├── routes/                      # Auth, Tasks, Projects, Users, Activities, Webhooks
│   ├── seed/seed.js                 # Demo data seeder
│   └── server.js                    # Entry (Helmet + CORS + Morgan + Error Handler)
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 📧 Demo Credentials

| Email | Password | Role |
|:---|:---|:---|
| nva@saashub.com | password123 | Tech Lead |
| ptb@saashub.com | password123 | Frontend Dev |
| lac@saashub.com | password123 | UX Designer |
| mqd@saashub.com | password123 | Backend Dev |
| the@saashub.com | password123 | Product Manager |

---

## 📝 License

MIT © 2026 SaaSHub
