# Implementation Plan

## Phase 1: Frontend Refactoring & Routing

- [x] 1. Install dependencies and set up routing infrastructure



  - Install react-router-dom in client project
  - Configure BrowserRouter in main.jsx
  - Create pages directory structure
  - _Requirements: 1.1_

- [x] 2. Extract and modularize existing components


- [x] 2.1 Extract Navbar component

  - Move Navbar logic to `client/src/components/Navbar.jsx`
  - Preserve all Tailwind styles and scroll behavior
  - Export and import in App.jsx
  - _Requirements: 2.2, 2.7_

- [x] 2.2 Extract IntroScreen component

  - Move IntroScreen to `client/src/components/IntroScreen.jsx`
  - Preserve all animations and interactive card behaviors
  - _Requirements: 2.6, 3.1-3.7_

- [x] 2.3 Extract CourseCard component

  - Create reusable CourseCard component
  - Support different display modes (grid, list)
  - _Requirements: 2.3_

- [x] 2.4 Extract PaymentModal component

  - Move PaymentModal to separate file
  - Preserve payment method selection UI
  - _Requirements: 2.4_

- [x] 2.5 Extract AuthModal component

  - Move AuthModal to separate file
  - Preserve login/register toggle functionality
  - _Requirements: 2.5_

- [x] 2.6 Extract Button component

  - Create reusable Button with variant support
  - _Requirements: 2.7_

- [x] 3. Implement page components with routing


- [x] 3.1 Create Home page component

  - Implement course listing view
  - Add topic filtering
  - Wire up to `/` route
  - _Requirements: 1.2_

- [x] 3.2 Create CourseDetail page component

  - Implement course detail view with description
  - Add purchase button
  - Wire up to `/course/:id` route
  - _Requirements: 1.3_

- [x] 3.3 Create TopicPage component

  - Implement filtered course view by topic
  - Wire up to `/topic/:type` route
  - _Requirements: 1.4_

- [x] 3.4 Create LoginPage component

  - Render AuthModal on this route
  - Wire up to `/login` route
  - _Requirements: 1.5_

- [x] 3.5 Configure admin routing

  - Set up nested routes for admin section
  - Wire up to `/admin/*` routes
  - _Requirements: 1.6_

- [ ]* 3.6 Write unit tests for routing
  - Test route navigation without page reload
  - Test dynamic parameter extraction
  - Test browser back/forward buttons
  - _Requirements: 1.2-1.7_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Backend API Implementation

- [x] 5. Set up backend infrastructure


- [x] 5.1 Install backend dependencies


  - Install express, cors, body-parser, lowdb, jsonwebtoken, bcrypt, multer
  - Create package.json with proper scripts
  - _Requirements: 4.1_

- [x] 5.2 Initialize LowDB with data models

  - Create db/index.js with LowDB setup
  - Initialize JSON files for users, courses, orders, activityLogs
  - Implement data loading on server start
  - _Requirements: 4.1, 4.5_

- [ ]* 5.3 Write property test for data persistence
  - **Property 6: Data persistence round-trip**
  - **Validates: Requirements 4.2, 4.3, 4.4**

- [ ]* 5.4 Write property test for server restart persistence
  - **Property 7: Data survives server restart**
  - **Validates: Requirements 4.5**

- [x] 5.3 Create middleware for IP capture

  - Implement ipCapture.js middleware
  - Extract IP from request (handle X-Forwarded-For)
  - Support IPv4 and IPv6
  - _Requirements: 15.1-15.4_

- [ ]* 5.4 Write property test for IP capture
  - **Property 46: IP capture on registration and login**
  - **Property 47: IP format handling**
  - **Property 48: Proxy IP extraction**
  - **Validates: Requirements 15.1-15.4**

- [x] 5.5 Create middleware for activity logging

  - Implement logger.js middleware
  - Log all authentication actions
  - Store action type, timestamp, IP, user agent
  - _Requirements: 16.1, 16.2_

- [ ]* 5.6 Write property test for activity logging
  - **Property 51: Activity log creation**
  - **Property 52: Activity log completeness**
  - **Validates: Requirements 16.1, 16.2**

- [x] 5.7 Create authentication middleware

  - Implement auth.js middleware
  - Validate JWT tokens from Authorization header
  - Return 401 for invalid/missing tokens
  - _Requirements: 13.6_

- [ ]* 5.8 Write property test for JWT validation
  - **Property 11: JWT token validation**
  - **Property 40: Authentication middleware**
  - **Validates: Requirements 5.6, 13.6**

- [x] 6. Implement authentication endpoints


- [x] 6.1 Implement user registration endpoint

  - POST /api/register
  - Validate email format and password strength
  - Hash password with bcrypt
  - Store user with registration IP and user agent
  - Return JWT token
  - _Requirements: 5.1, 5.2, 15.5_

- [ ]* 6.2 Write property tests for registration
  - **Property 8: Email and password validation**
  - **Property 9: Password hashing security**
  - **Property 49: Registration metadata completeness**
  - **Validates: Requirements 5.1, 5.2, 15.5**

- [x] 6.3 Implement user login endpoint

  - POST /api/login
  - Verify credentials with bcrypt
  - Record login IP and timestamp
  - Return JWT token on success
  - Return generic error on failure
  - _Requirements: 5.3, 5.4, 5.5, 15.2_

- [ ]* 6.4 Write property tests for login
  - **Property 10: Authentication credential verification**
  - **Validates: Requirements 5.3, 5.5**

- [x] 7. Implement course endpoints


- [x] 7.1 Implement course listing endpoint

  - GET /api/courses
  - Return all active courses
  - Include title, price, category, sales, image
  - Sort by creation date descending
  - _Requirements: 6.1, 6.4, 9.6_

- [ ]* 7.2 Write property tests for course listing
  - **Property 12: Course listing completeness**
  - **Property 25: Course list sorting**
  - **Validates: Requirements 6.1, 6.4, 9.6**

- [x] 7.3 Implement course detail endpoint

  - GET /api/courses/:id
  - Return complete course information
  - Return 404 for non-existent courses
  - _Requirements: 6.2, 6.3_

- [ ]* 7.4 Write property tests for course detail
  - **Property 13: Course detail retrieval**
  - **Property 14: Non-existent course error handling**
  - **Validates: Requirements 6.2, 6.3**

- [x] 8. Implement order processing endpoints


- [x] 8.1 Implement order creation endpoint

  - POST /api/orders/create
  - Verify user authentication
  - Create order with pending status
  - Record IP and user agent
  - Simulate payment processing
  - Update order status to paid on success
  - Increment course sales counter
  - _Requirements: 7.1, 7.3, 7.4, 7.5_

- [ ]* 8.2 Write property tests for order processing
  - **Property 15: Purchase authentication requirement**
  - **Property 16: Order creation and status management**
  - **Property 17: Payment failure handling**
  - **Validates: Requirements 7.1, 7.3, 7.4, 7.5, 7.6**

- [x] 9. Implement admin statistics endpoints


- [x] 9.1 Implement statistics endpoint

  - GET /api/admin/stats
  - Calculate GMV (exclude refunded orders)
  - Count total orders
  - Count total users
  - Format currency values
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 9.2 Write property tests for statistics
  - **Property 18: GMV calculation accuracy**
  - **Property 19: Count accuracy**
  - **Property 20: Currency formatting consistency**
  - **Validates: Requirements 8.1-8.5**

- [x] 9.3 Implement orders list endpoint

  - GET /api/admin/orders
  - Return all orders with user and course details
  - Require admin authentication
  - _Requirements: 8.1_

- [x] 10. Implement admin course management endpoints


- [x] 10.1 Implement course creation endpoint

  - POST /api/admin/courses
  - Validate required fields
  - Assign unique ID
  - Save course record
  - _Requirements: 9.1, 9.2_

- [ ]* 10.2 Write property tests for course creation
  - **Property 21: Course creation validation**
  - **Property 22: Unique ID assignment**
  - **Validates: Requirements 9.1, 9.2**

- [x] 10.3 Implement course update endpoint

  - PUT /api/admin/courses/:id
  - Update only provided fields
  - Validate data
  - _Requirements: 9.3_

- [ ]* 10.4 Write property test for course update
  - **Property 23: Partial update correctness**
  - **Validates: Requirements 9.3**

- [x] 10.5 Implement course deletion endpoint

  - DELETE /api/admin/courses/:id
  - Check for associated orders
  - Prevent deletion if orders exist
  - Remove course record
  - _Requirements: 9.4, 9.5_

- [ ]* 10.6 Write property test for course deletion
  - **Property 24: Referential integrity on deletion**
  - **Validates: Requirements 9.5**

- [x] 11. Implement refund endpoint


- [x] 11.1 Implement refund processing endpoint

  - POST /api/admin/refund
  - Verify order exists and is paid
  - Update order status to refunded
  - Decrement course sales counter
  - Prevent duplicate refunds
  - Log refund with admin ID and timestamp
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 11.2 Write property tests for refund
  - **Property 33: Refund precondition validation**
  - **Property 34: Refund side effects**
  - **Property 35: Refund idempotency**
  - **Property 36: Refund audit logging**
  - **Validates: Requirements 12.1-12.5**

- [x] 12. Implement user management endpoints


- [x] 12.1 Implement user list endpoint

  - GET /api/admin/users
  - Return all users with basic info
  - Support search by name or email
  - Require admin authentication
  - _Requirements: 14.1, 14.2, 14.3_

- [ ]* 12.2 Write property tests for user management
  - **Property 41: User list completeness**
  - **Property 42: User search filtering**
  - **Validates: Requirements 14.1, 14.2, 14.3**

- [x] 12.3 Implement user detail endpoint

  - GET /api/admin/users/:id
  - Return complete user profile
  - Include order history
  - Include IP history and activity logs
  - _Requirements: 14.4, 15.6_

- [ ]* 12.4 Write property test for user detail
  - **Property 43: User detail completeness**
  - **Property 50: IP history display**
  - **Validates: Requirements 14.4, 15.6**

- [x] 12.5 Implement user role update endpoint

  - PUT /api/admin/users/:id/role
  - Validate role value
  - Update user record
  - _Requirements: 14.5_

- [ ]* 12.6 Write property test for role update
  - **Property 44: Role update validation**
  - **Validates: Requirements 14.5**

- [x] 12.7 Implement user deactivation endpoint

  - PUT /api/admin/users/:id/deactivate
  - Set user status to inactive
  - Update login endpoint to check status
  - _Requirements: 14.6, 14.7_

- [ ]* 12.8 Write property test for user deactivation
  - **Property 45: User deactivation prevents login**
  - **Validates: Requirements 14.6, 14.7**

- [x] 13. Implement activity log endpoints


- [x] 13.1 Implement activity log query endpoint

  - GET /api/admin/users/:id/activity
  - Return chronological list of activities
  - Support filtering by date range and action type
  - Implement pagination (50 per page)
  - Include success/failure status for login attempts
  - Link to related orders for purchase actions
  - _Requirements: 16.3, 16.4, 16.5, 16.6, 16.7_

- [ ]* 13.2 Write property tests for activity logs
  - **Property 53: Activity log chronological ordering**
  - **Property 54: Login attempt status tracking**
  - **Property 55: Activity log filtering**
  - **Property 56: Activity log pagination**
  - **Validates: Requirements 16.3, 16.4, 16.6, 16.7**

- [x] 14. Implement API response consistency


- [x] 14.1 Create response formatter utility

  - Standardize success/error response structure
  - Ensure all endpoints use consistent format
  - _Requirements: 13.3_

- [ ]* 14.2 Write property test for API responses
  - **Property 37: Response structure consistency**
  - **Property 38: HTTP status code correctness**
  - **Property 39: Request logging**
  - **Validates: Requirements 13.3, 13.4, 13.5**

- [x] 15. Configure CORS and security



- [x] 15.1 Configure CORS middleware

  - Whitelist client application origin
  - Configure credentials support
  - _Requirements: 13.1_

- [x] 15.2 Add request logging middleware

  - Log method, path, timestamp for all requests
  - _Requirements: 13.5_

- [ ] 16. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Admin Enhancement

- [x] 17. Integrate rich text editor




- [ ] 17.1 Install react-quill in admin project
  - Add react-quill dependency
  - Import Quill styles


  - _Requirements: 10.1_

- [ ] 17.2 Update CourseModal with React Quill
  - Replace description textarea with ReactQuill component
  - Configure toolbar with formatting options
  - Support bold, italic, underline, strikethrough
  - Support ordered and unordered lists
  - Support multiple heading levels
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x]* 17.3 Write property tests for rich text


  - **Property 26: Formatting preservation round-trip**
  - **Property 27: XSS prevention**
  - **Validates: Requirements 10.2-10.6**





- [ ] 17.3 Implement HTML sanitization
  - Add DOMPurify for XSS prevention
  - Sanitize HTML before saving
  - Sanitize HTML before rendering
  - _Requirements: 10.6_

- [ ] 18. Implement file upload functionality
- [ ] 18.1 Add file upload to backend
  - Install multer
  - Configure multer for image uploads
  - Create uploads directory
  - Validate file type (JPEG, PNG, WebP)
  - Validate file size (max 5MB)
  - Generate unique filenames
  - Return public URL path

  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x]* 18.2 Write property tests for file upload

  - **Property 28: File type validation**
  - **Property 29: File size validation**
  - **Property 30: Unique filename generation**
  - **Property 31: Upload URL response**




  - **Property 32: Validation error specificity**
  - **Validates: Requirements 11.1, 11.2, 11.4, 11.5, 11.7**

- [x] 18.3 Configure Express static middleware

  - Serve uploads directory as static files
  - _Requirements: 11.6_

- [ ] 18.4 Update CourseModal with file upload
  - Replace image URL input with file upload
  - Add image preview

  - Handle upload errors
  - _Requirements: 11.1, 11.7_

- [ ] 19. Add user management interface
- [x] 19.1 Create UserManager component

  - Display user list table
  - Show ID, name, email, registration date, role
  - Add search functionality
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 19.2 Create UserDetail modal
  - Display complete user profile

  - Show order history

  - Show IP history (registration IP, last login IP)
  - Show activity log with pagination
  - _Requirements: 14.4, 15.6, 16.3_

- [ ] 19.3 Add user management actions
  - Implement role update UI
  - Implement user deactivation UI
  - Add confirmation dialogs




  - _Requirements: 14.5, 14.6_

- [x] 19.4 Add activity log viewer


  - Display chronological activity list
  - Show action type, timestamp, IP, status
  - Implement date range filter
  - Implement action type filter
  - Implement pagination (50 per page)

  - Link purchase actions to orders
  - _Requirements: 16.3, 16.4, 16.5, 16.6, 16.7_

- [ ] 20. Update admin navigation
- [x] 20.1 Add Users menu item

  - Add navigation button for user management
  - Wire up to user management view
  - _Requirements: 14.1_


- [ ] 21. Checkpoint - Ensure all admin tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Frontend-Backend Integration


- [ ] 22. Connect frontend to backend APIs
- [ ] 22.1 Update API_URL configuration
  - Use environment variables for API URL
  - Configure for development and production

  - _Requirements: 13.1_

- [ ] 22.2 Implement authentication flow
  - Connect AuthModal to /api/register and /api/login
  - Store JWT token in localStorage

  - Add Authorization header to authenticated requests
  - Handle token expiration and refresh
  - _Requirements: 5.3, 5.4, 13.6_

- [x] 22.3 Connect course listing

  - Fetch courses from /api/courses
  - Remove mock course data
  - Handle loading and error states
  - _Requirements: 6.1_


- [ ] 22.4 Connect course detail
  - Fetch course detail from /api/courses/:id
  - Handle 404 errors

  - _Requirements: 6.2, 6.3_


- [ ] 22.5 Connect payment flow
  - Send order to /api/orders/create
  - Handle payment success/failure

  - Update UI on completion
  - _Requirements: 7.1-7.6_

- [x] 22.6 Connect admin statistics

  - Fetch stats from /api/admin/stats
  - Display GMV, order count, user count
  - _Requirements: 8.1-8.5_





- [ ] 22.7 Connect admin course management
  - Wire up create, update, delete operations

  - Handle validation errors
  - Refresh data after operations
  - _Requirements: 9.1-9.6_


- [ ] 22.8 Connect admin refund
  - Wire up refund button to /api/admin/refund
  - Handle success/error responses
  - Refresh order list
  - _Requirements: 12.1-12.5_

- [ ] 22.9 Connect admin user management
  - Fetch user list from /api/admin/users
  - Implement search functionality
  - Wire up role update and deactivation
  - _Requirements: 14.1-14.7_

- [ ] 22.10 Connect activity log viewer
  - Fetch activity logs from /api/admin/users/:id/activity
  - Implement filtering and pagination
  - _Requirements: 16.3-16.7_

- [ ] 23. Remove all mock data
- [ ] 23.1 Remove mock course data
  - Delete hardcoded course arrays
  - Ensure all data comes from API
  - _Requirements: 6.1_

- [ ] 23.2 Remove mock order data
  - Delete mock order arrays
  - Ensure all orders come from API
  - _Requirements: 8.1_

- [ ] 23.3 Remove mock user data
  - Delete hardcoded user objects
  - Ensure authentication uses API
  - _Requirements: 5.3_

- [ ] 24. Implement error handling
- [ ] 24.1 Add global error boundary
  - Catch React errors
  - Display user-friendly error page
  - Log errors for debugging

- [ ] 24.2 Add API error handling
  - Handle network errors
  - Display error messages to users
  - Implement retry logic for failed requests

- [ ] 24.3 Add form validation
  - Validate inputs before submission
  - Display inline validation errors
  - Prevent invalid submissions

- [x] 25. Final checkpoint - Full integration test





  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Testing and Optimization


- [ ] 26. Run complete test suite
- [ ] 26.1 Run all unit tests
  - Execute frontend unit tests
  - Execute backend unit tests
  - Verify >80% code coverage

- [ ] 26.2 Run all property-based tests
  - Execute all 56 property tests
  - Verify 100 iterations per test
  - Fix any failing properties

- [ ]* 26.3 Run integration tests
  - Test complete user flows
  - Test admin workflows
  - Test error scenarios

- [ ] 27. Performance optimization
- [ ] 27.1 Optimize frontend bundle
  - Implement code splitting
  - Lazy load routes
  - Optimize images

- [ ] 27.2 Optimize backend performance
  - Add response caching
  - Optimize database queries
  - Add request rate limiting

- [ ] 28. Security audit
- [ ] 28.1 Review authentication implementation
  - Verify password hashing
  - Verify JWT implementation
  - Test token expiration

- [ ] 28.2 Review input validation
  - Test XSS prevention
  - Test file upload security
  - Test SQL injection prevention (if applicable)

- [ ] 28.3 Review CORS configuration
  - Verify origin whitelist
  - Test credentials handling

- [ ] 29. Documentation
- [ ] 29.1 Update README with setup instructions
  - Document installation steps
  - Document environment variables
  - Document API endpoints

- [ ] 29.2 Add API documentation
  - Document all endpoints
  - Include request/response examples
  - Document error codes

- [ ] 30. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.
