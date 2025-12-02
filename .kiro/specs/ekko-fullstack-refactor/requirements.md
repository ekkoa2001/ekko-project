# Requirements Document

## Introduction

本文档定义了 Ekko 项目从 UI 原型到生产级全栈应用的重构需求。Ekko 是一个在线课程销售平台，目前使用 Mock 数据和单文件组件结构。重构目标是实现前端模块化、后端 API 完善、以及后台管理功能增强，使其成为可部署的生产级应用。

## Glossary

- **Client Application**: 面向用户的前端应用，使用 React + Vite + Tailwind CSS 构建
- **Admin Application**: 后台管理系统，用于课程和订单管理
- **Server Application**: 后端 API 服务，使用 Express.js 构建
- **Course**: 课程实体，包含标题、价格、分类、描述等信息
- **Order**: 订单实体，记录用户购买课程的交易信息
- **User**: 用户实体，包含认证信息和角色
- **IntroScreen**: 开屏引导动画组件
- **React Router**: 前端路由库，用于实现 SPA 路由功能
- **LowDB**: 轻量级 JSON 数据库，用于数据持久化
- **JWT**: JSON Web Token，用于用户认证
- **Multer**: Node.js 文件上传中间件
- **React Quill**: React 富文本编辑器组件
- **Activity Log**: 活动日志实体，记录用户的操作行为和系统事件
- **IP Address**: 互联网协议地址，用于标识网络设备的唯一地址
- **User Agent**: 浏览器或客户端应用的标识字符串
- **X-Forwarded-For**: HTTP 请求头，包含通过代理服务器的原始客户端 IP 地址
- **Payment Gateway**: 支付网关，第三方支付服务提供商的 API 接口
- **WeChat Pay**: 微信支付，腾讯提供的移动支付服务
- **Alipay**: 支付宝，阿里巴巴提供的第三方支付平台
- **Stripe**: 国际信用卡支付处理平台
- **Webhook**: Web 回调，支付网关用于异步通知支付结果的 HTTP 回调接口
- **Promotion**: 促销活动实体，包含折扣信息和有效期
- **Discount**: 折扣，可以是百分比折扣或固定金额折扣
- **Preview Lesson**: 预览课程，允许未购买用户免费观看的课程内容
- **Curriculum**: 课程大纲，包含所有课程章节和课时的结构化列表
- **Testimonial**: 用户评价，学生对课程或平台的反馈和评分

## Requirements

### Requirement 1

**User Story:** 作为开发者，我希望前端应用使用路由系统，以便用户可以通过 URL 直接访问特定页面并支持浏览器前进后退功能

#### Acceptance Criteria

1. WHEN the Client Application starts THEN the system SHALL initialize React Router with browser history support
2. WHEN a user navigates to `/` THEN the system SHALL display the home page with course listings
3. WHEN a user navigates to `/course/:id` THEN the system SHALL display the course detail page for the specified course ID
4. WHEN a user navigates to `/topic/:type` THEN the system SHALL display the topic page filtered by the specified type
5. WHEN a user navigates to `/login` THEN the system SHALL display the authentication modal
6. WHEN a user navigates to `/admin/*` THEN the system SHALL display the admin application with nested routes
7. WHEN a user clicks browser back button THEN the system SHALL navigate to the previous route without page reload

### Requirement 2

**User Story:** 作为开发者，我希望将大型组件拆分为独立的模块文件，以便提高代码可维护性和复用性

#### Acceptance Criteria

1. WHEN the Client Application is structured THEN the system SHALL organize components in the `client/src/components/` directory
2. WHEN a Navbar component is needed THEN the system SHALL import it from a separate file
3. WHEN a CourseCard component is needed THEN the system SHALL import it from a separate file
4. WHEN a PaymentModal component is needed THEN the system SHALL import it from a separate file
5. WHEN an AuthModal component is needed THEN the system SHALL import it from a separate file
6. WHEN an IntroScreen component is needed THEN the system SHALL import it from a separate file
7. WHEN components are refactored THEN the system SHALL preserve all existing Tailwind CSS styles and animations

### Requirement 3

**User Story:** 作为用户，我希望在首次访问时看到开屏引导动画，以便了解平台特色

#### Acceptance Criteria

1. WHEN a user visits the Client Application for the first time THEN the system SHALL display the IntroScreen component
2. WHEN the IntroScreen is displayed THEN the system SHALL show three interactive cards with animations
3. WHEN a user hovers over the TikTok card THEN the system SHALL animate view and like counters
4. WHEN a user hovers over the Shopify card THEN the system SHALL animate scrolling order notifications
5. WHEN a user hovers over the features card THEN the system SHALL animate checkmark completions
6. WHEN a user clicks the enter button THEN the system SHALL hide IntroScreen and show the main application
7. WHEN IntroScreen is dismissed THEN the system SHALL not display it again in the same session

### Requirement 4

**User Story:** 作为用户，我希望后端 API 能够持久化存储数据，以便我的购买记录和课程信息在服务器重启后仍然保留

#### Acceptance Criteria

1. WHEN the Server Application starts THEN the system SHALL initialize LowDB with JSON file storage
2. WHEN course data is modified THEN the system SHALL persist changes to `courses.json`
3. WHEN user data is modified THEN the system SHALL persist changes to `users.json`
4. WHEN order data is created THEN the system SHALL persist changes to `orders.json`
5. WHEN the Server Application restarts THEN the system SHALL load existing data from JSON files

### Requirement 5

**User Story:** 作为用户，我希望能够注册和登录账户，以便购买课程和查看订单历史

#### Acceptance Criteria

1. WHEN a user submits registration form THEN the system SHALL validate email format and password strength
2. WHEN registration data is valid THEN the system SHALL create a new User record with hashed password
3. WHEN a user submits login form THEN the system SHALL verify credentials against stored User data
4. WHEN login credentials are valid THEN the system SHALL return a JWT token and user information
5. WHEN login credentials are invalid THEN the system SHALL return an error message without exposing which field is incorrect
6. WHEN a JWT token is provided THEN the system SHALL validate token signature and expiration

### Requirement 6

**User Story:** 作为用户，我希望能够浏览课程列表和查看课程详情，以便选择适合的课程购买

#### Acceptance Criteria

1. WHEN a user requests course list THEN the system SHALL return all active courses with basic information
2. WHEN a user requests a specific course by ID THEN the system SHALL return complete course details including description
3. WHEN a course does not exist THEN the system SHALL return a 404 error with appropriate message
4. WHEN courses are displayed THEN the system SHALL show title, price, category, sales count, and image

### Requirement 7

**User Story:** 作为用户，我希望能够购买课程并完成支付流程，以便获得课程访问权限

#### Acceptance Criteria

1. WHEN a user initiates purchase THEN the system SHALL verify user authentication status
2. WHEN a user selects payment method THEN the system SHALL display appropriate payment interface (WeChat, Alipay, or Card)
3. WHEN a user confirms payment THEN the system SHALL create an Order record with pending status
4. WHEN payment is processed successfully THEN the system SHALL update Order status to paid
5. WHEN an Order is created THEN the system SHALL increment the course sales counter
6. WHEN payment fails THEN the system SHALL return error message and maintain Order in failed status

### Requirement 8

**User Story:** 作为管理员，我希望能够查看销售统计数据，以便了解平台运营状况

#### Acceptance Criteria

1. WHEN an admin requests statistics THEN the system SHALL calculate total GMV from all paid orders
2. WHEN an admin requests statistics THEN the system SHALL count total number of orders
3. WHEN an admin requests statistics THEN the system SHALL count total number of registered users
4. WHEN calculating GMV THEN the system SHALL exclude refunded orders from the total
5. WHEN statistics are displayed THEN the system SHALL format currency values with appropriate symbols

### Requirement 9

**User Story:** 作为管理员，我希望能够创建、编辑和删除课程，以便管理平台内容

#### Acceptance Criteria

1. WHEN an admin creates a new course THEN the system SHALL validate required fields (title, price, category)
2. WHEN course data is valid THEN the system SHALL assign a unique ID and save the Course record
3. WHEN an admin edits a course THEN the system SHALL update only the provided fields
4. WHEN an admin deletes a course THEN the system SHALL remove the Course record from storage
5. WHEN a course has associated orders THEN the system SHALL prevent deletion and return an error message
6. WHEN course list is requested THEN the system SHALL return courses sorted by creation date descending

### Requirement 10

**User Story:** 作为管理员，我希望能够使用富文本编辑器编辑课程描述，以便创建格式化的课程内容

#### Acceptance Criteria

1. WHEN an admin opens course editor THEN the system SHALL display React Quill rich text editor
2. WHEN an admin formats text THEN the system SHALL support bold, italic, underline, and strikethrough
3. WHEN an admin creates lists THEN the system SHALL support ordered and unordered lists
4. WHEN an admin adds headings THEN the system SHALL support multiple heading levels
5. WHEN course description is saved THEN the system SHALL store HTML content with formatting preserved
6. WHEN course description is displayed THEN the system SHALL render HTML content safely without XSS vulnerabilities

### Requirement 11

**User Story:** 作为管理员，我希望能够上传课程图片，以便为课程添加视觉内容

#### Acceptance Criteria

1. WHEN an admin selects an image file THEN the system SHALL validate file type (JPEG, PNG, WebP)
2. WHEN an image file is valid THEN the system SHALL validate file size does not exceed 5MB
3. WHEN an admin uploads an image THEN the system SHALL save the file to `server/uploads` directory
4. WHEN an image is saved THEN the system SHALL generate a unique filename to prevent conflicts
5. WHEN an image upload succeeds THEN the system SHALL return the public URL path
6. WHEN the Server Application serves uploads THEN the system SHALL configure Express static middleware for the uploads directory
7. WHEN an invalid file is uploaded THEN the system SHALL return an error message with specific validation failure reason

### Requirement 12

**User Story:** 作为管理员，我希望能够处理订单退款，以便解决客户服务问题

#### Acceptance Criteria

1. WHEN an admin initiates refund THEN the system SHALL verify the Order exists and is in paid status
2. WHEN refund is confirmed THEN the system SHALL update Order status to refunded
3. WHEN an Order is refunded THEN the system SHALL decrement the course sales counter
4. WHEN an Order is already refunded THEN the system SHALL prevent duplicate refund and return error message
5. WHEN refund is processed THEN the system SHALL log the refund transaction with timestamp and admin ID

### Requirement 13

**User Story:** 作为开发者，我希望前端和后端之间有清晰的 API 接口定义，以便前后端可以独立开发和测试

#### Acceptance Criteria

1. WHEN the Server Application starts THEN the system SHALL enable CORS for the Client Application origin
2. WHEN API endpoints are defined THEN the system SHALL use RESTful conventions for resource naming
3. WHEN API responses are sent THEN the system SHALL include consistent structure with success flag and data/error fields
4. WHEN API errors occur THEN the system SHALL return appropriate HTTP status codes (400, 401, 404, 500)
5. WHEN API requests are received THEN the system SHALL log request method, path, and timestamp
6. WHEN API endpoints require authentication THEN the system SHALL validate JWT token in Authorization header

### Requirement 14

**User Story:** 作为管理员，我希望能够查看和管理所有注册用户，以便监控用户活动和处理账户问题

#### Acceptance Criteria

1. WHEN an admin requests user list THEN the system SHALL return all registered users with basic information
2. WHEN user list is displayed THEN the system SHALL show user ID, name, email, registration date, and role
3. WHEN an admin searches for a user THEN the system SHALL filter users by name or email
4. WHEN an admin views user details THEN the system SHALL display complete user profile including order history
5. WHEN an admin updates user role THEN the system SHALL validate role value and update the User record
6. WHEN an admin deactivates a user THEN the system SHALL set user status to inactive and prevent login
7. WHEN a deactivated user attempts login THEN the system SHALL return an error message indicating account is inactive

### Requirement 15

**User Story:** 作为管理员，我希望系统能够记录用户的 IP 地址和注册信息，以便进行安全审计和防止欺诈行为

#### Acceptance Criteria

1. WHEN a user registers THEN the system SHALL capture the client IP address from the request
2. WHEN a user logs in THEN the system SHALL record the login IP address and timestamp
3. WHEN IP address is captured THEN the system SHALL handle both IPv4 and IPv6 formats
4. WHEN IP address is behind a proxy THEN the system SHALL extract real IP from X-Forwarded-For header
5. WHEN user registration is completed THEN the system SHALL store registration IP, registration date, and user agent
6. WHEN an admin views user details THEN the system SHALL display registration IP, last login IP, and login history
7. WHEN suspicious activity is detected THEN the system SHALL log IP address changes and multiple failed login attempts

### Requirement 16

**User Story:** 作为管理员，我希望能够查看用户的登录历史和活动日志，以便追踪用户行为和排查问题

#### Acceptance Criteria

1. WHEN a user performs authentication action THEN the system SHALL create an activity log entry
2. WHEN activity log is created THEN the system SHALL record action type, timestamp, IP address, and user agent
3. WHEN an admin views user activity THEN the system SHALL display chronological list of user actions
4. WHEN activity log includes login attempts THEN the system SHALL indicate success or failure status
5. WHEN activity log includes purchases THEN the system SHALL link to the corresponding Order record
6. WHEN activity logs are queried THEN the system SHALL support filtering by date range and action type
7. WHEN activity logs exceed 1000 entries per user THEN the system SHALL implement pagination with 50 entries per page

### Requirement 17

**User Story:** 作为用户，我希望能够使用真实的支付网关完成支付，以便实际购买课程并获得访问权限

#### Acceptance Criteria

1. WHEN a user selects WeChat Pay THEN the system SHALL integrate with WeChat Pay API to generate payment QR code
2. WHEN a user selects Alipay THEN the system SHALL integrate with Alipay API to generate payment QR code or redirect URL
3. WHEN a user selects credit card payment THEN the system SHALL integrate with Stripe API to process card transactions
4. WHEN payment is initiated THEN the system SHALL create a payment session with unique transaction ID
5. WHEN payment gateway returns success callback THEN the system SHALL verify payment signature and update Order status
6. WHEN payment gateway returns failure callback THEN the system SHALL update Order status to failed and notify user
7. WHEN payment verification fails THEN the system SHALL log the security event and prevent order completion
8. WHEN payment is pending THEN the system SHALL implement webhook endpoint to receive asynchronous payment notifications
9. WHEN payment amount is processed THEN the system SHALL ensure amount matches the course price to prevent tampering

### Requirement 18

**User Story:** 作为管理员，我希望能够为课程设置促销价格，以便在特定时期吸引更多用户购买

#### Acceptance Criteria

1. WHEN an admin creates a promotion THEN the system SHALL validate promotion start date is before end date
2. WHEN a promotion is active THEN the system SHALL display promotional price alongside original price with strikethrough
3. WHEN a user purchases during promotion period THEN the system SHALL charge the promotional price
4. WHEN promotion period ends THEN the system SHALL automatically revert to original price
5. WHEN multiple promotions exist for a course THEN the system SHALL apply the promotion with lowest price
6. WHEN an admin creates a promotion THEN the system SHALL support percentage discount or fixed amount discount
7. WHEN promotional price is calculated THEN the system SHALL ensure final price is not negative or zero
8. WHEN course list is displayed THEN the system SHALL show discount badge for courses with active promotions
9. WHEN promotion is scheduled THEN the system SHALL activate automatically at start time without manual intervention

### Requirement 19

**User Story:** 作为用户，我希望能够查看平台的详细介绍和特色功能，以便了解平台价值和学习资源

#### Acceptance Criteria

1. WHEN a user navigates to `/about` THEN the system SHALL display the about page with platform introduction
2. WHEN about page is displayed THEN the system SHALL show platform mission, vision, and core values
3. WHEN about page is displayed THEN the system SHALL list key features with icons and descriptions
4. WHEN about page is displayed THEN the system SHALL show instructor profiles with photos and credentials
5. WHEN about page is displayed THEN the system SHALL include student testimonials with ratings
6. WHEN about page is displayed THEN the system SHALL show platform statistics (total courses, students, completion rate)
7. WHEN a user views course categories THEN the system SHALL display category descriptions and learning paths
8. WHEN a user views a course THEN the system SHALL show curriculum outline with lesson titles and durations
9. WHEN a user views a course THEN the system SHALL display instructor information and teaching experience
10. WHEN a user views a course THEN the system SHALL show student reviews with ratings and comments

### Requirement 20

**User Story:** 作为用户，我希望能够在购买前预览课程内容，以便评估课程质量和适合度

#### Acceptance Criteria

1. WHEN a course has preview lessons THEN the system SHALL mark specific lessons as free preview
2. WHEN a user views course detail THEN the system SHALL display preview lesson indicators
3. WHEN a user clicks preview lesson THEN the system SHALL play video or display content without requiring purchase
4. WHEN a user attempts to access non-preview lesson THEN the system SHALL prompt for purchase or login
5. WHEN preview content is displayed THEN the system SHALL show watermark indicating preview mode
6. WHEN course includes downloadable resources THEN the system SHALL list resource names and file sizes
7. WHEN a user purchases course THEN the system SHALL grant access to all lessons and downloadable resources
