# Design Document

## Overview

Ekko 平台的全栈重构设计旨在将现有的 UI 原型转变为生产级的在线课程销售平台。本设计基于现代 Web 技术栈，采用前后端分离架构，实现了完整的用户认证、课程管理、订单处理、支付集成和促销系统。

**核心技术栈：**
- **前端**: React 18 + Vite + React Router + Tailwind CSS
- **后端**: Node.js + Express.js + LowDB
- **认证**: JWT (JSON Web Tokens) + bcrypt
- **支付**: Stripe (信用卡) + 微信支付 + 支付宝
- **文件上传**: Multer
- **富文本编辑**: React Quill

**架构原则：**
- RESTful API 设计
- 无状态认证（JWT）
- 数据持久化（JSON 文件存储）
- 模块化组件设计
- 安全第一（密码加密、支付验证、XSS 防护）

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  User Application (Port 5173)  │  Admin Application (5174)  │
│  - React Router                 │  - Course Management       │
│  - Course Browsing              │  - Order Management        │
│  - Authentication               │  - User Management         │
│  - Payment Flow                 │  - Promotion Management    │
└─────────────────┬───────────────┴────────────────────────────┘
                  │
                  │ HTTP/HTTPS + JWT
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                     API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Express.js Server (Port 3000)                              │
│  - CORS Middleware                                           │
│  - Request Logger                                            │
│  - IP Capture Middleware                                     │
│  - JWT Authentication Middleware                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                     Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Route Handlers                                              │
│  - /api/auth/*      - Authentication & Registration         │
│  - /api/courses/*   - Course CRUD Operations                │
│  - /api/orders/*    - Order Management & Refunds            │
│  - /api/users/*     - User Management                       │
│  - /api/payments/*  - Payment Processing                    │
│  - /api/promotions/* - Promotion Management                 │
│  - /api/upload      - File Upload                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                     Data Access Layer                        │
├─────────────────────────────────────────────────────────────┤
│  LowDB Collections                                           │
│  - courses.json     - Course catalog                        │
│  - users.json       - User accounts & profiles              │
│  - orders.json      - Purchase transactions                 │
│  - activityLogs.json - User activity tracking               │
│  - promotions.json  - Promotional campaigns                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   External Services Layer                    │
├─────────────────────────────────────────────────────────────┤
│  - Stripe API (Credit Card Processing)                      │
│  - WeChat Pay API (Mobile Payment - China)                  │
│  - Alipay API (Mobile Payment - China)                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**用户购买课程流程：**
```
User → Browse Courses → Select Course → Click Purchase
  → Authentication Check → Payment Method Selection
  → Payment Gateway Integration → Payment Confirmation
  → Order Creation → Course Access Granted
```

**管理员创建促销流程：**
```
Admin → Login → Navigate to Promotions → Create Promotion
  → Set Discount & Date Range → Save Promotion
  → System Auto-applies at Start Time → Auto-expires at End Time
```

## Components and Interfaces

### Frontend Components

#### User Application Components

**1. Navbar Component**
- Props: `user`, `onLogout`
- Responsibilities: 导航菜单、用户状态显示、登录/登出按钮
- State: 无（受控组件）

**2. IntroScreen Component**
- Props: `onComplete`
- Responsibilities: 首次访问引导动画、三个交互卡片展示
- State: `hoveredCard`, `animationState`

**3. CourseCard Component**
- Props: `course`, `onClick`
- Responsibilities: 课程卡片展示、价格显示（含促销价）、折扣标识
- State: 无（受控组件）

**4. PaymentModal Component**
- Props: `course`, `isOpen`, `onClose`, `onSuccess`
- Responsibilities: 支付方式选择、支付流程处理、支付状态反馈
- State: `paymentMethod`, `loading`, `error`, `paymentSession`

**5. AuthModal Component**
- Props: `isOpen`, `onClose`, `onSuccess`, `mode`
- Responsibilities: 登录/注册表单、表单验证、错误提示
- State: `formData`, `errors`, `isSubmitting`

**6. CourseDetail Page**
- Responsibilities: 课程详情展示、课程大纲、讲师信息、学生评价、预览课程
- State: `course`, `reviews`, `previewLesson`

**7. AboutPage Component**
- Responsibilities: 平台介绍、特色功能、讲师团队、学生评价、统计数据
- State: `statistics`, `testimonials`, `instructors`

#### Admin Application Components

**1. CourseManagement Component**
- Responsibilities: 课程列表、创建/编辑/删除课程、图片上传、富文本编辑
- State: `courses`, `editingCourse`, `isModalOpen`

**2. OrderManagement Component**
- Responsibilities: 订单列表、订单详情、退款处理、订单筛选
- State: `orders`, `filters`, `selectedOrder`

**3. UserManagement Component**
- Responsibilities: 用户列表、用户详情、IP 记录、活动日志、角色管理
- State: `users`, `selectedUser`, `activityLogs`, `searchQuery`

**4. PromotionManagement Component**
- Responsibilities: 促销列表、创建/编辑/删除促销、促销状态管理
- State: `promotions`, `editingPromotion`, `isModalOpen`

**5. Dashboard Component**
- Responsibilities: 统计数据展示、GMV、订单数、用户数、图表可视化
- State: `statistics`, `chartData`

### Backend API Endpoints

#### Authentication Endpoints

```typescript
POST /api/auth/register
Request: { name, email, password }
Response: { success, data: { user, token } }

POST /api/auth/login
Request: { email, password }
Response: { success, data: { user, token } }

GET /api/auth/verify
Headers: { Authorization: "Bearer <token>" }
Response: { success, data: { user } }
```

#### Course Endpoints

```typescript
GET /api/courses
Response: { success, data: Course[] }

GET /api/courses/:id
Response: { success, data: Course }

POST /api/courses (Admin only)
Request: { title, price, category, description, imageUrl, curriculum }
Response: { success, data: Course }

PUT /api/courses/:id (Admin only)
Request: Partial<Course>
Response: { success, data: Course }

DELETE /api/courses/:id (Admin only)
Response: { success, message }
```

#### Order Endpoints

```typescript
GET /api/orders (Authenticated)
Response: { success, data: Order[] }

POST /api/orders (Authenticated)
Request: { courseId, paymentMethod }
Response: { success, data: { order, paymentSession } }

POST /api/orders/:id/refund (Admin only)
Response: { success, data: Order }
```

#### Payment Endpoints

```typescript
POST /api/payments/create-session
Request: { orderId, paymentMethod }
Response: { success, data: { sessionId, qrCode, redirectUrl } }

POST /api/payments/webhook/stripe
Request: Stripe webhook payload
Response: { received: true }

POST /api/payments/webhook/wechat
Request: WeChat Pay webhook payload
Response: { code: "SUCCESS" }

POST /api/payments/webhook/alipay
Request: Alipay webhook payload
Response: { code: "SUCCESS" }

GET /api/payments/verify/:orderId
Response: { success, data: { status, order } }
```

#### Promotion Endpoints

```typescript
GET /api/promotions
Response: { success, data: Promotion[] }

GET /api/promotions/active/:courseId
Response: { success, data: Promotion | null }

POST /api/promotions (Admin only)
Request: { courseId, discountType, discountValue, startDate, endDate }
Response: { success, data: Promotion }

PUT /api/promotions/:id (Admin only)
Request: Partial<Promotion>
Response: { success, data: Promotion }

DELETE /api/promotions/:id (Admin only)
Response: { success, message }
```

#### User Management Endpoints

```typescript
GET /api/users (Admin only)
Response: { success, data: User[] }

GET /api/users/:id (Admin only)
Response: { success, data: { user, activityLogs, orders } }

PUT /api/users/:id/role (Admin only)
Request: { role }
Response: { success, data: User }

PUT /api/users/:id/status (Admin only)
Request: { status }
Response: { success, data: User }
```

#### Upload Endpoint

```typescript
POST /api/upload
Content-Type: multipart/form-data
Request: FormData with 'image' field
Response: { success, data: { url } }
```

## Data Models

### User Model

```typescript
interface User {
  id: string;                    // UUID
  name: string;
  email: string;                 // Unique
  password: string;              // bcrypt hashed
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  registrationIp: string;
  registrationDate: string;      // ISO 8601
  lastLoginIp: string;
  lastLoginDate: string;         // ISO 8601
  userAgent: string;
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

### Course Model

```typescript
interface Course {
  id: string;                    // UUID
  title: string;
  description: string;           // HTML content from React Quill
  price: number;                 // Original price in cents
  category: string;
  imageUrl: string;
  sales: number;                 // Total sales count
  curriculum: Lesson[];          // Course outline
  instructorId: string;          // Reference to User
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}

interface Lesson {
  id: string;
  title: string;
  duration: number;              // Duration in minutes
  isPreview: boolean;            // Free preview flag
  videoUrl?: string;
  content?: string;
  order: number;                 // Display order
}
```

### Order Model

```typescript
interface Order {
  id: string;                    // UUID
  userId: string;                // Reference to User
  courseId: string;              // Reference to Course
  amount: number;                // Amount paid in cents
  originalAmount: number;        // Original price before discount
  discountAmount: number;        // Discount applied
  promotionId?: string;          // Reference to Promotion if applicable
  paymentMethod: 'wechat' | 'alipay' | 'card';
  paymentSessionId: string;      // Payment gateway session ID
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string;               // ISO 8601
  refundedAt?: string;           // ISO 8601
  refundedBy?: string;           // Admin user ID
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

### Promotion Model

```typescript
interface Promotion {
  id: string;                    // UUID
  courseId: string;              // Reference to Course
  discountType: 'percentage' | 'fixed';
  discountValue: number;         // Percentage (0-100) or fixed amount in cents
  startDate: string;             // ISO 8601
  endDate: string;               // ISO 8601
  status: 'scheduled' | 'active' | 'expired';
  createdBy: string;             // Admin user ID
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

### ActivityLog Model

```typescript
interface ActivityLog {
  id: string;                    // UUID
  userId: string;                // Reference to User
  action: 'login' | 'logout' | 'register' | 'purchase' | 'refund' | 'profile_update';
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>; // Additional context (e.g., orderId for purchases)
  timestamp: string;             // ISO 8601
}
```

### Review Model

```typescript
interface Review {
  id: string;                    // UUID
  courseId: string;              // Reference to Course
  userId: string;                // Reference to User
  rating: number;                // 1-5 stars
  comment: string;
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

### Instructor Model

```typescript
interface Instructor {
  id: string;                    // UUID
  name: string;
  bio: string;
  photoUrl: string;
  credentials: string[];
  experience: string;
  coursesCount: number;
  studentsCount: number;
  rating: number;                // Average rating
  createdAt: string;             // ISO 8601
}
```

### PlatformStatistics Model

```typescript
interface PlatformStatistics {
  totalCourses: number;
  totalStudents: number;
  totalInstructors: number;
  completionRate: number;        // Percentage
  averageRating: number;
  totalGMV: number;              // Total revenue in cents
  lastUpdated: string;           // ISO 8601
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Routing and Navigation Properties

**Property 1: Course route parameter handling**
*For any* valid course ID, navigating to `/course/:id` should display the course detail page with the correct course data
**Validates: Requirements 1.3**

**Property 2: Topic route parameter handling**
*For any* valid topic type, navigating to `/topic/:type` should display the topic page filtered by that type
**Validates: Requirements 1.4**

**Property 3: Browser history navigation**
*For any* sequence of route navigations, clicking the browser back button should navigate to the previous route without triggering a page reload
**Validates: Requirements 1.7**

**Property 4: Component style preservation**
*For any* component refactoring, all Tailwind CSS styles and animations should remain identical to the original implementation
**Validates: Requirements 2.7**

### Data Persistence Properties

**Property 5: Course data persistence**
*For any* course modification (create, update, delete), the changes should be persisted to `courses.json` and survive server restarts
**Validates: Requirements 4.2, 4.5**

**Property 6: User data persistence**
*For any* user modification (create, update), the changes should be persisted to `users.json` and survive server restarts
**Validates: Requirements 4.3, 4.5**

**Property 7: Order data persistence**
*For any* order creation, the order should be persisted to `orders.json` and survive server restarts
**Validates: Requirements 4.4, 4.5**

### Authentication and Security Properties

**Property 8: Registration validation**
*For any* registration attempt, the system should validate email format and password strength before creating a user account
**Validates: Requirements 5.1**

**Property 9: Password hashing**
*For any* valid registration, the system should store the password as a bcrypt hash, never in plaintext
**Validates: Requirements 5.2**

**Property 10: Login credential verification**
*For any* login attempt, the system should verify credentials against stored user data and return appropriate success or error response
**Validates: Requirements 5.3**

**Property 11: JWT token generation**
*For any* valid login, the system should return a JWT token with proper signature and expiration
**Validates: Requirements 5.4**

**Property 12: Login error message security**
*For any* invalid login attempt, the error message should not expose whether the email or password was incorrect
**Validates: Requirements 5.5**

**Property 13: JWT token validation**
*For any* JWT token provided in requests, the system should validate signature and expiration before granting access
**Validates: Requirements 5.6, 13.6**

### Course Management Properties

**Property 14: Course retrieval by ID**
*For any* valid course ID, requesting that course should return complete course details including description
**Validates: Requirements 6.2**

**Property 15: Non-existent course handling**
*For any* non-existent course ID, the system should return a 404 error with an appropriate message
**Validates: Requirements 6.3**

**Property 16: Course display completeness**
*For any* course displayed, it should include title, price, category, sales count, and image
**Validates: Requirements 6.4**

**Property 17: Course creation validation**
*For any* course creation attempt, the system should validate required fields (title, price, category) before saving
**Validates: Requirements 9.1**

**Property 18: Course ID uniqueness**
*For any* valid course creation, the system should assign a unique ID that doesn't conflict with existing courses
**Validates: Requirements 9.2**

**Property 19: Partial course updates**
*For any* course edit operation, only the provided fields should be updated while other fields remain unchanged
**Validates: Requirements 9.3**

**Property 20: Course deletion**
*For any* course without associated orders, deletion should remove the course from storage
**Validates: Requirements 9.4**

**Property 21: Course deletion protection**
*For any* course with associated orders, deletion attempts should be prevented and return an error message
**Validates: Requirements 9.5**

**Property 22: Course list sorting**
*For any* course list request, courses should be returned sorted by creation date in descending order
**Validates: Requirements 9.6**

### Payment and Order Properties

**Property 23: Purchase authentication check**
*For any* purchase attempt, the system should verify user authentication status before proceeding
**Validates: Requirements 7.1**

**Property 24: Payment interface selection**
*For any* payment method selection (WeChat, Alipay, Card), the system should display the appropriate payment interface
**Validates: Requirements 7.2**

**Property 25: Order creation on payment**
*For any* payment confirmation, the system should create an Order record with pending status
**Validates: Requirements 7.3**

**Property 26: Order status update on success**
*For any* successful payment, the system should update the Order status to paid
**Validates: Requirements 7.4**

**Property 27: Sales counter increment**
*For any* order creation, the system should increment the course sales counter by one
**Validates: Requirements 7.5**

**Property 28: Failed payment handling**
*For any* failed payment, the system should maintain the Order in failed status and return an error message
**Validates: Requirements 7.6**

**Property 29: Payment amount verification**
*For any* payment processed, the amount should match the course price (or promotional price) to prevent tampering
**Validates: Requirements 17.9**

### Statistics and Reporting Properties

**Property 30: GMV calculation**
*For any* set of orders, the total GMV should equal the sum of all paid orders excluding refunded orders
**Validates: Requirements 8.1, 8.4**

**Property 31: Order count accuracy**
*For any* set of orders, the total count should equal the number of order records
**Validates: Requirements 8.2**

**Property 32: User count accuracy**
*For any* set of users, the total count should equal the number of user records
**Validates: Requirements 8.3**

**Property 33: Currency formatting**
*For any* currency value displayed, it should be formatted with the appropriate currency symbol
**Validates: Requirements 8.5**

### Rich Text Editor Properties

**Property 34: Text formatting support**
*For any* text formatting operation (bold, italic, underline, strikethrough), the formatting should be applied correctly
**Validates: Requirements 10.2**

**Property 35: List creation support**
*For any* list creation operation, both ordered and unordered lists should be supported
**Validates: Requirements 10.3**

**Property 36: Heading support**
*For any* heading addition, multiple heading levels should be supported
**Validates: Requirements 10.4**

**Property 37: HTML content round-trip**
*For any* formatted course description, saving and then loading should preserve all formatting
**Validates: Requirements 10.5**

**Property 38: XSS prevention**
*For any* HTML content displayed, it should be sanitized to prevent XSS vulnerabilities
**Validates: Requirements 10.6**


### File Upload Properties

**Property 39: File type validation**
*For any* file upload attempt, the system should validate that the file type is JPEG, PNG, or WebP
**Validates: Requirements 11.1**

**Property 40: File size validation**
*For any* valid file type, the system should validate that file size does not exceed 5MB
**Validates: Requirements 11.2**

**Property 41: File storage**
*For any* valid image upload, the file should be saved to the `server/uploads` directory
**Validates: Requirements 11.3**

**Property 42: Filename uniqueness**
*For any* image save operation, the generated filename should be unique to prevent conflicts
**Validates: Requirements 11.4**

**Property 43: Upload URL response**
*For any* successful upload, the system should return the public URL path
**Validates: Requirements 11.5**

**Property 44: Invalid file error messages**
*For any* invalid file upload, the system should return an error message with the specific validation failure reason
**Validates: Requirements 11.7**

### Refund Properties

**Property 45: Refund eligibility verification**
*For any* refund attempt, the system should verify the Order exists and is in paid status
**Validates: Requirements 12.1**

**Property 46: Refund status update**
*For any* confirmed refund, the system should update the Order status to refunded
**Validates: Requirements 12.2**

**Property 47: Sales counter decrement**
*For any* refunded order, the system should decrement the course sales counter by one
**Validates: Requirements 12.3**

**Property 48: Duplicate refund prevention**
*For any* already-refunded order, duplicate refund attempts should be prevented and return an error
**Validates: Requirements 12.4**

**Property 49: Refund logging**
*For any* processed refund, the system should log the transaction with timestamp and admin ID
**Validates: Requirements 12.5**

### API Response Properties

**Property 50: Response structure consistency**
*For any* API response, it should include a consistent structure with success flag and data/error fields
**Validates: Requirements 13.3**

**Property 51: HTTP status code accuracy**
*For any* API error, the system should return the appropriate HTTP status code (400, 401, 404, 500)
**Validates: Requirements 13.4**

**Property 52: Request logging**
*For any* API request received, the system should log the request method, path, and timestamp
**Validates: Requirements 13.5**

### User Management Properties

**Property 53: User display completeness**
*For any* user displayed in the admin panel, it should show user ID, name, email, registration date, and role
**Validates: Requirements 14.2**

**Property 54: User search filtering**
*For any* search query, the system should filter users by name or email matching the query
**Validates: Requirements 14.3**

**Property 55: User details completeness**
*For any* user details view, it should display complete user profile including order history
**Validates: Requirements 14.4**

**Property 56: User role update validation**
*For any* role update attempt, the system should validate the role value and update the User record
**Validates: Requirements 14.5**

**Property 57: User deactivation**
*For any* user deactivation, the system should set user status to inactive and prevent login
**Validates: Requirements 14.6**

**Property 58: Inactive user login prevention**
*For any* inactive user login attempt, the system should return an error indicating the account is inactive
**Validates: Requirements 14.7**

### IP Tracking Properties

**Property 59: Registration IP capture**
*For any* user registration, the system should capture the client IP address from the request
**Validates: Requirements 15.1**

**Property 60: Login IP recording**
*For any* user login, the system should record the login IP address and timestamp
**Validates: Requirements 15.2**

**Property 61: IP format handling**
*For any* IP address captured, the system should handle both IPv4 and IPv6 formats correctly
**Validates: Requirements 15.3**

**Property 62: Proxy IP extraction**
*For any* request behind a proxy, the system should extract the real IP from X-Forwarded-For header
**Validates: Requirements 15.4**

**Property 63: Registration metadata storage**
*For any* completed registration, the system should store registration IP, registration date, and user agent
**Validates: Requirements 15.5**

**Property 64: IP information display**
*For any* user details view, it should display registration IP, last login IP, and login history
**Validates: Requirements 15.6**

**Property 65: Suspicious activity logging**
*For any* suspicious activity detected, the system should log IP address changes and multiple failed login attempts
**Validates: Requirements 15.7**

### Activity Logging Properties

**Property 66: Authentication action logging**
*For any* authentication action performed, the system should create an activity log entry
**Validates: Requirements 16.1**

**Property 67: Activity log completeness**
*For any* activity log created, it should record action type, timestamp, IP address, and user agent
**Validates: Requirements 16.2**

**Property 68: Activity chronological display**
*For any* user activity view, actions should be displayed in chronological order
**Validates: Requirements 16.3**

**Property 69: Login attempt status indication**
*For any* login attempt in activity logs, it should indicate success or failure status
**Validates: Requirements 16.4**

**Property 70: Purchase order linking**
*For any* purchase in activity logs, it should link to the corresponding Order record
**Validates: Requirements 16.5**

**Property 71: Activity log filtering**
*For any* filter criteria (date range, action type), the system should filter activity logs correctly
**Validates: Requirements 16.6**

**Property 72: Activity log pagination**
*For any* user with more than 1000 activity log entries, the system should implement pagination with 50 entries per page
**Validates: Requirements 16.7**

### Payment Gateway Integration Properties

**Property 73: WeChat Pay QR generation**
*For any* WeChat Pay selection, the system should integrate with WeChat Pay API to generate a payment QR code
**Validates: Requirements 17.1**

**Property 74: Alipay payment generation**
*For any* Alipay selection, the system should integrate with Alipay API to generate payment QR code or redirect URL
**Validates: Requirements 17.2**

**Property 75: Stripe payment session**
*For any* credit card payment selection, the system should integrate with Stripe API to create a payment session
**Validates: Requirements 17.3**

**Property 76: Payment session uniqueness**
*For any* payment initiation, the system should create a payment session with a unique transaction ID
**Validates: Requirements 17.4**

**Property 77: Payment callback verification**
*For any* payment gateway success callback, the system should verify payment signature and update Order status
**Validates: Requirements 17.5**

**Property 78: Payment failure handling**
*For any* payment gateway failure callback, the system should update Order status to failed and notify the user
**Validates: Requirements 17.6**

**Property 79: Payment verification failure logging**
*For any* payment verification failure, the system should log the security event and prevent order completion
**Validates: Requirements 17.7**


### Promotion Properties

**Property 80: Promotion date validation**
*For any* promotion creation, the system should validate that start date is before end date
**Validates: Requirements 18.1**

**Property 81: Promotional price display**
*For any* active promotion, the system should display promotional price alongside original price with strikethrough
**Validates: Requirements 18.2**

**Property 82: Promotional price charging**
*For any* purchase during promotion period, the system should charge the promotional price instead of original price
**Validates: Requirements 18.3**

**Property 83: Promotion expiration**
*For any* expired promotion, the system should automatically revert to original price
**Validates: Requirements 18.4**

**Property 84: Multiple promotion handling**
*For any* course with multiple active promotions, the system should apply the promotion with the lowest price
**Validates: Requirements 18.5**

**Property 85: Discount type support**
*For any* promotion creation, the system should support both percentage discount and fixed amount discount
**Validates: Requirements 18.6**

**Property 86: Promotional price validation**
*For any* promotional price calculation, the final price should not be negative or zero
**Validates: Requirements 18.7**

**Property 87: Discount badge display**
*For any* course with active promotion, the course list should show a discount badge
**Validates: Requirements 18.8**

**Property 88: Promotion auto-activation**
*For any* scheduled promotion, the system should activate automatically at start time without manual intervention
**Validates: Requirements 18.9**

### Platform Information Properties

**Property 89: Instructor profile display**
*For any* instructor on the about page, the system should display profile with photo and credentials
**Validates: Requirements 19.4**

**Property 90: Testimonial display**
*For any* testimonial displayed, it should include rating and comment
**Validates: Requirements 19.5**

**Property 91: Category description display**
*For any* course category, the system should display category description and learning path
**Validates: Requirements 19.7**

**Property 92: Curriculum display**
*For any* course viewed, the system should show curriculum outline with lesson titles and durations
**Validates: Requirements 19.8**

**Property 93: Instructor information display**
*For any* course viewed, the system should display instructor information and teaching experience
**Validates: Requirements 19.9**

**Property 94: Course reviews display**
*For any* course viewed, the system should show student reviews with ratings and comments
**Validates: Requirements 19.10**

### Course Preview Properties

**Property 95: Preview lesson marking**
*For any* course with preview lessons, specific lessons should be marked as free preview
**Validates: Requirements 20.1**

**Property 96: Preview indicator display**
*For any* course detail view, preview lesson indicators should be displayed
**Validates: Requirements 20.2**

**Property 97: Preview lesson access**
*For any* preview lesson, users should be able to play video or display content without requiring purchase
**Validates: Requirements 20.3**

**Property 98: Non-preview lesson restriction**
*For any* non-preview lesson access attempt, the system should prompt for purchase or login
**Validates: Requirements 20.4**

**Property 99: Preview watermark display**
*For any* preview content displayed, the system should show a watermark indicating preview mode
**Validates: Requirements 20.5**

**Property 100: Downloadable resources listing**
*For any* course with downloadable resources, the system should list resource names and file sizes
**Validates: Requirements 20.6**

**Property 101: Post-purchase access grant**
*For any* course purchase, the system should grant access to all lessons and downloadable resources
**Validates: Requirements 20.7**

## Error Handling

### Error Categories

**1. Validation Errors (400 Bad Request)**
- Invalid email format
- Weak password (less than 8 characters)
- Missing required fields
- Invalid file type or size
- Invalid date ranges for promotions
- Negative or zero prices

**2. Authentication Errors (401 Unauthorized)**
- Invalid credentials
- Expired JWT token
- Missing JWT token
- Invalid JWT signature
- Inactive user account

**3. Authorization Errors (403 Forbidden)**
- Non-admin attempting admin operations
- Accessing other users' private data

**4. Not Found Errors (404 Not Found)**
- Course not found
- User not found
- Order not found
- Promotion not found

**5. Conflict Errors (409 Conflict)**
- Email already registered
- Duplicate refund attempt
- Deleting course with existing orders

**6. Server Errors (500 Internal Server Error)**
- Database write failures
- Payment gateway communication errors
- File system errors
- Unexpected exceptions

### Error Response Format

All errors follow a consistent structure:

```typescript
{
  success: false,
  error: {
    code: string,        // Machine-readable error code
    message: string,     // Human-readable error message
    details?: any        // Optional additional context
  }
}
```

### Error Handling Strategy

**Frontend Error Handling:**
- Display user-friendly error messages in modals or toast notifications
- Log errors to console for debugging
- Implement retry logic for transient failures
- Provide fallback UI for critical failures

**Backend Error Handling:**
- Catch all exceptions and return appropriate HTTP status codes
- Log errors with stack traces for debugging
- Never expose sensitive information in error messages
- Implement circuit breakers for external service calls (payment gateways)

**Payment Error Handling:**
- Implement webhook retry logic with exponential backoff
- Store failed payment attempts for manual review
- Send email notifications for payment failures
- Provide clear instructions for users to retry payment

## Testing Strategy

### Unit Testing

**Testing Framework:** Vitest (for both frontend and backend)

**Frontend Unit Tests:**
- Component rendering tests
- User interaction tests (clicks, form submissions)
- State management tests
- Route navigation tests
- Form validation tests

**Backend Unit Tests:**
- API endpoint tests
- Data validation tests
- Authentication middleware tests
- Database operation tests
- File upload tests

**Key Unit Test Examples:**
- Test that login form validates email format
- Test that course creation requires all mandatory fields
- Test that JWT middleware rejects invalid tokens
- Test that file upload rejects files over 5MB
- Test that refund endpoint prevents duplicate refunds

### Property-Based Testing

**Testing Framework:** fast-check (JavaScript/TypeScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Use custom generators for domain-specific data (courses, users, orders)
- Implement shrinking for minimal failing examples

**Property Test Tagging:**
Each property-based test MUST include a comment tag referencing the design document:
```typescript
// Feature: ekko-fullstack-refactor, Property 5: Course data persistence
```

**Key Property Tests:**
- Data persistence round-trip tests (save and load)
- Authentication token generation and validation
- Price calculation with promotions
- Order status transitions
- IP address format handling
- Activity log pagination

**Generator Strategy:**
- Create generators for User, Course, Order, Promotion models
- Generate edge cases: empty strings, very long strings, special characters
- Generate boundary values: min/max prices, dates
- Generate invalid data to test error handling

### Integration Testing

**Testing Approach:**
- Test complete user flows end-to-end
- Test API endpoints with real database operations
- Test payment webhook flows with mock payment gateways
- Test file upload with temporary test files

**Key Integration Tests:**
- Complete registration → login → purchase → access course flow
- Admin creates course → user purchases → admin refunds flow
- Promotion creation → auto-activation → price calculation flow
- File upload → course creation → course display flow

### Test Organization

```
client/
  src/
    components/
      __tests__/
        Navbar.test.jsx
        CourseCard.test.jsx
        PaymentModal.test.jsx
    pages/
      __tests__/
        Home.test.jsx
        CourseDetail.test.jsx

server/
  __tests__/
    unit/
      auth.test.js
      courses.test.js
      orders.test.js
      promotions.test.js
    integration/
      purchase-flow.test.js
      refund-flow.test.js
      promotion-flow.test.js
    properties/
      persistence.property.test.js
      authentication.property.test.js
      pricing.property.test.js
      validation.property.test.js
```

### Testing Best Practices

1. **Test Isolation:** Each test should be independent and not rely on other tests
2. **Test Data:** Use factories or fixtures to generate test data
3. **Mocking:** Mock external services (payment gateways) but avoid mocking internal logic
4. **Coverage:** Aim for 80%+ code coverage, 100% for critical paths
5. **Performance:** Keep unit tests fast (<100ms each), integration tests reasonable (<5s each)
6. **Continuous Integration:** Run all tests on every commit
7. **Property Tests:** Focus on invariants and round-trip properties
8. **Edge Cases:** Explicitly test boundary conditions and error paths

## Security Considerations

### Authentication Security

- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens with 24-hour expiration
- Secure token storage (httpOnly cookies recommended for production)
- Rate limiting on login attempts (max 5 per minute per IP)
- Account lockout after 10 failed login attempts

### Payment Security

- Payment amount verification on server side
- Webhook signature verification for all payment callbacks
- HTTPS required for all payment-related endpoints
- PCI DSS compliance for credit card handling (delegated to Stripe)
- Logging of all payment verification failures

### Data Security

- Input validation and sanitization on all user inputs
- XSS prevention through React's built-in escaping
- SQL injection prevention (not applicable with LowDB, but principle applies)
- File upload restrictions (type, size, content validation)
- CORS configuration to allow only trusted origins

### API Security

- JWT authentication for all protected endpoints
- Role-based access control (admin vs user)
- IP address logging for audit trail
- Rate limiting on all API endpoints
- Request size limits to prevent DoS attacks

## Deployment Considerations

### Environment Configuration

```
Production Environment Variables:
- NODE_ENV=production
- JWT_SECRET=<strong-random-secret>
- STRIPE_SECRET_KEY=<stripe-secret>
- WECHAT_PAY_APP_ID=<wechat-app-id>
- WECHAT_PAY_MCH_ID=<wechat-merchant-id>
- WECHAT_PAY_API_KEY=<wechat-api-key>
- ALIPAY_APP_ID=<alipay-app-id>
- ALIPAY_PRIVATE_KEY=<alipay-private-key>
- CORS_ORIGIN=https://ekko.example.com
- PORT=3000
```

### Database Migration

- LowDB JSON files should be backed up regularly
- Consider migration to PostgreSQL or MongoDB for production scale
- Implement database versioning for schema changes

### Performance Optimization

- Enable gzip compression for API responses
- Implement caching for course list and statistics
- Use CDN for static assets (images, CSS, JS)
- Optimize images (WebP format, lazy loading)
- Implement pagination for large data sets

### Monitoring and Logging

- Log all API requests with response times
- Monitor payment webhook success rates
- Track error rates by endpoint
- Set up alerts for critical failures
- Implement health check endpoint

### Scalability Considerations

- Horizontal scaling: Run multiple server instances behind load balancer
- Session management: Use Redis for distributed session storage
- File storage: Migrate to S3 or similar object storage
- Database: Migrate to scalable database solution
- Caching: Implement Redis for frequently accessed data

