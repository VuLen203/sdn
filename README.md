# Quiz Application – Full Stack

Ứng dụng quiz full-stack sử dụng Node.js/Express/MongoDB (backend) và React/Redux/Bootstrap 5 (frontend).

---

## Cấu trúc thư mục

```
assignment_3w/
├── backend/
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── admin.js         # Admin role check
│   ├── models/
│   │   ├── User.js          # User model (bcrypt password)
│   │   └── Quiz.js          # Quiz + embedded Question model
│   ├── routes/
│   │   ├── auth.js          # /api/auth/*
│   │   └── quiz.js          # /api/quizzes/* + nested questions
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js         # Axios instance with auth interceptor
    │   ├── components/
    │   │   ├── AdminRoute.jsx   # Admin-only route guard
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminQuestions.jsx
    │   │   │   └── AdminQuizList.jsx
    │   │   ├── Login.jsx
    │   │   ├── QuizDetail.jsx
    │   │   ├── QuizList.jsx
    │   │   └── Register.jsx
    │   ├── redux/
    │   │   ├── slices/
    │   │   │   ├── authSlice.js
    │   │   │   └── quizSlice.js
    │   │   └── store.js
    │   ├── App.jsx
    │   └── index.js
    └── package.json
```

---

## Cài đặt và chạy

### Yêu cầu

- Node.js >= 16
- MongoDB đang chạy trên `localhost:27017`

### Backend

```bash
cd backend
npm install
# Chỉnh .env nếu cần (MONGODB_URI, JWT_SECRET, PORT)
npm run dev        # development (nodemon)
# hoặc
npm start          # production
```

Server chạy tại: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm start
```

App chạy tại: `http://localhost:3000`

---

## API Endpoints

### Auth

| Method | URL                  | Mô tả           |
| ------ | -------------------- | --------------- |
| POST   | `/api/auth/register` | Đăng ký         |
| POST   | `/api/auth/login`    | Đăng nhập → JWT |
| POST   | `/api/auth/logout`   | Đăng xuất       |

### Quizzes (yêu cầu JWT)

| Method | URL                                          | Role       | Mô tả          |
| ------ | -------------------------------------------- | ---------- | -------------- |
| GET    | `/api/quizzes`                               | user/admin | Danh sách quiz |
| GET    | `/api/quizzes/:id`                           | user/admin | Chi tiết quiz  |
| POST   | `/api/quizzes`                               | admin      | Tạo quiz       |
| PUT    | `/api/quizzes/:id`                           | admin      | Sửa quiz       |
| DELETE | `/api/quizzes/:id`                           | admin      | Xoá quiz       |
| POST   | `/api/quizzes/:quizId/questions`             | admin      | Thêm câu hỏi   |
| PUT    | `/api/quizzes/:quizId/questions/:questionId` | admin      | Sửa câu hỏi    |
| DELETE | `/api/quizzes/:quizId/questions/:questionId` | admin      | Xoá câu hỏi    |

---

## Tạo tài khoản Admin

Gọi API register với field `role: "admin"`:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"admin"}'
```

---

## Luồng sử dụng

**User thường:** Đăng ký → Đăng nhập → Xem danh sách quiz → Làm quiz → Xem kết quả → Đăng xuất

**Admin:** Đăng nhập → Quản lý Quiz (CRUD) → Thêm/Sửa/Xoá câu hỏi
