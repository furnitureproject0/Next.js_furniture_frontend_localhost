# 🌍 i18n Translation Checklist / قائمة التحقق من الترجمة

## ✅ Infrastructure Completed / البنية التحتية مكتملة
- [x] Language switcher component created
- [x] Redux language slice created
- [x] Translation hook (useTranslation) created
- [x] Language switcher added to Sidebar
- [x] Basic translation files structure (5 languages)
- [x] Language initializer component
- [x] RTL support for Arabic

---

## 📋 Pages & Components Requiring Translation / الصفحات والمكونات التي تحتاج ترجمة

### 🔐 Authentication Pages / صفحات المصادقة
- [ ] **src/app/login/page.js**
  - "Angebots Profi" (brand name)
  - "Sign in to your account"
  - "Email Address"
  - "Password"
  - "Enter your email"
  - "Enter your password"
  - "Remember me"
  - "Forgot password?"
  - "Signing in..." / "Sign In"
  - "Don't have an account?"
  - "Contact administrator"

---

### 🎯 Dashboard Pages / صفحات لوحات التحكم

#### Customer Dashboard / لوحة تحكم العميل
- [ ] **src/app/customer/dashboard/page.js**
  - "My Orders"
  - "Track and manage your furniture moving orders"
  - "New Order"

#### Site Admin Dashboard / لوحة تحكم مدير الموقع
- [ ] **src/app/site-admin/dashboard/page.js**
  - "Site Admin Dashboard"
  - "Manage all transportation orders and oversee business operations"
  - "New Order"

#### Company Admin Dashboard / لوحة تحكم مدير الشركة
- [ ] **src/app/company-admin/dashboard/page.js**
  - "Company Dashboard"
  - "Manage your assigned orders and team operations"

#### Super Admin Dashboard / لوحة تحكم المدير العام
- [ ] **src/app/super-admin/dashboard/page.js**
  - "Super Admin Dashboard"
  - "Manage all platform users, companies, and orders"
  - "Users"
  - "Orders"
  - "Companies"
  - "Settings"
  - "Settings management coming soon..."

#### Driver Dashboard / لوحة تحكم السائق
- [ ] **src/app/driver/dashboard/page.js**
  - "My Orders"
  - "Manage your assigned orders and transportation tasks"

#### Worker Dashboard / لوحة تحكم العامل
- [ ] **src/app/worker/dashboard/page.js**
  - "Worker Dashboard"
  - "Manage your job assignments and tasks"
  - "Rating"
  - "Furniture Assembly"
  - "Packing"

#### Finance Page / صفحة المالية
- [ ] **src/app/company-admin/finance/page.js**
  - "Finance Dashboard"
  - "Monitor your financial performance and track revenue, expenses, and transactions."
  - "Transactions"
  - "Add Expense"
  - "Export Excel"
  - "Show Filters" / "Hide Filters"
  - Period labels: "7 days", "30 days", "90 days", "1 year", "Custom Range"

---

### 🧭 Sidebar Navigation / شريط التنقل الجانبي
- [ ] **src/components/Sidebar.js**
  - Navigation items:
    - "Dashboard"
    - "Transport Orders"
    - "Finance"
    - "Staff Management"
    - "User Management"
    - "Company Settings"
    - "My Orders"
    - "Support"
    - "My Jobs"
  - "Coming Soon" badges
  - User role display

---

### 📦 Order Components / مكونات الطلبات

#### Order Modals / نوافذ الطلبات
- [ ] **src/components/customer/NewCustomerOrderModal.js**
  - "Create New Order"
  - Step titles: "Select Services", "Addresses & Details", "Room Configuration", "Schedule & Notes"
  - "Back", "Cancel", "Next", "Submit Order"

- [ ] **src/components/site-admin/SiteAdminOrderModal.js**
  - Same as NewCustomerOrderModal

- [ ] **src/components/modals/PricingModal.js**
  - "Modify Offer" / "Send Offer"
  - "Order {id}"
  - "(Modifying v{version})"
  - "Estimated Hours"
  - "hours"
  - "Hourly Rate (CHF)"
  - "per hour"
  - "Scheduled Date (Optional)"
  - "Additional Notes (Optional)"
  - "Any special instructions or details..."
  - "Total Price"
  - "{hours} hours × CHF {rate}/hour"
  - "Cancel"
  - "Update Offer" / "Send Offer"

- [ ] **src/components/modals/TeamAssignmentModal.js**
  - "Assign Team"
  - "Select Team Members"
  - "Team Leader"
  - "Select Team Leader"
  - "Experience"
  - "Specialties"
  - "Unavailable"
  - "Driver"
  - "Mover"
  - "Cancel"
  - "Assign Team"

- [ ] **src/components/modals/CompanyAssignmentModal.js**
  - "Assign Company"
  - "Select a company to handle order {id}"
  - "Location"
  - "Completed Orders"
  - "Unavailable"
  - "Cancel"

#### Order Steps / خطوات الطلب
- [ ] **src/components/customer/order-steps/CustomerServiceStep.js**
  - "Select the services you need"
  - "You can select one or more services for your order"
  - "{count} service(s) selected"

- [ ] **src/components/customer/order-steps/CustomerAddressStep.js**
  - "From Address" / "To Address" / "Extra Address"
  - "Location Type"
  - "Select location type..."
  - "Street Address"
  - "e.g., Bahnhofstrasse 1"
  - "ZIP Code"
  - "e.g., 8001"
  - "City"
  - "e.g., Zürich"
  - "Country"
  - "Floor Number"
  - "Number of Floors"
  - "Number of Rooms"
  - "Area (m²)"
  - "Has Elevator"
  - "Needs Crane"
  - "Additional Notes"

- [ ] **src/components/customer/order-steps/CustomerRoomConfigStep.js**
  - "Room Configuration (Optional)"
  - "Describe your rooms or furniture"
  - "Upload Images (Optional)"
  - "Drag and drop images here, or click to select"
  - "Supported formats: JPG, PNG, GIF (max 5MB)"

- [ ] **src/components/customer/order-steps/CustomerScheduleStep.js**
  - "Schedule & Additional Notes"
  - "When would you like the service? Any special requests?"
  - "Preferred Schedule"
  - "Preferred Date"
  - "Must be at least 1 day in advance"
  - "Preferred Time"
  - "Select a time"
  - Time slots: "Morning (8:00 - 10:00)", "Late Morning (10:00 - 12:00)", etc.
  - "Flexible"
  - "Note: This is your preferred schedule..."
  - "Additional Notes (Optional)"
  - Placeholder text for notes
  - "Ready to Submit!"
  - "Once you submit, your order will be sent..."

#### Order Cards & Lists / بطاقات وقوائم الطلبات
- [ ] **src/components/customer/CustomerOrderCard.js**
  - "View Details"
  - "Accept Offer"
  - "Reject"
  - Status badges
  - Date formatting

- [ ] **src/components/customer/CustomerOrderDetailModal.js**
  - "Order Details"
  - "Services"
  - "Addresses"
  - "From"
  - "To"
  - "Schedule"
  - "Date"
  - "Time"
  - "Notes"
  - "Offer Details"
  - "Price"
  - "Estimated Hours"
  - "Accept Offer"
  - "Reject Offer"
  - "Are you sure you want to reject this offer?"
  - "Please provide a reason (optional):"
  - "Reason for rejection..."

- [ ] **src/components/site-admin/SiteAdminOrderCard.js**
  - "Assign Company"
  - "View Details"
  - "Accept Offer"
  - "Reject"
  - "Reject Offer"
  - "Are you sure you want to reject this offer?"

- [ ] **src/components/dashboard/CompanyOrderCard.js**
  - "Set Price"
  - "Assign Team"
  - "View Details"

- [ ] **src/components/dashboard/OrderCard.js**
  - Similar to CompanyOrderCard

- [ ] **src/components/driver/OrderDetailModal.js**
  - Order details display
  - Action buttons

---

### 📊 Statistics & Stats Cards / الإحصائيات وبطاقات الإحصائيات
- [ ] **src/components/customer/CustomerStatsCards.js**
  - "Total Orders"
  - "Pending"
  - "In Progress"
  - "Completed"

- [ ] **src/components/site-admin/SiteAdminStatsCards.js**
  - Similar stats labels

- [ ] **src/components/dashboard/StatsCards.js**
  - Stats labels

- [ ] **src/components/driver/DriverStatsCards.js**
  - Driver-specific stats

- [ ] **src/components/worker/WorkerStatsCards.js**
  - Worker-specific stats

---

### 🔔 Notifications / الإشعارات
- [ ] **src/components/NotificationsSidebar.js**
  - "Notifications"
  - "Mark all as read"
  - "No notifications"
  - "You're all caught up!"
  - Time formatting (e.g., "2 hours ago", "Just now")

- [ ] **src/components/NotificationsCard.js**
  - Notification display text

- [ ] **src/store/slices/notificationsSlice.js**
  - All notification messages:
    - "New order #{id} created by {name}"
    - "Order #{id} has been assigned to your company"
    - "You received an offer of {amount} for order #{id}"
    - "Order #{id} offer accepted! Ready to assign team."
    - "Order #{id} offer rejected. {reason}"
    - "Your team has been assigned for order #{id}"
    - "You've been assigned to order #{id}"
    - "Your order #{id} has been completed!"
    - "Your order #{id} has started!"

---

### 💰 Finance Components / مكونات المالية
- [ ] **src/components/finance/FinanceStatsGrid.js**
  - "Total Revenue"
  - "Total Expenses"
  - "Net Profit"
  - "Transactions"

- [ ] **src/components/finance/FinanceChart.js**
  - Chart labels and tooltips

- [ ] **src/components/finance/PeriodSummary.js**
  - Period summary labels

- [ ] **src/components/finance/TransactionFilters.js**
  - "Search transactions..."
  - "All Types"
  - "Revenue"
  - "Expense"
  - "All Statuses"
  - "Completed"
  - "Pending"
  - "Failed"
  - "Clear Filters"

- [ ] **src/components/finance/TransactionList.js**
  - Transaction table headers
  - "Type", "Amount", "Date", "Status", "Description"

- [ ] **src/components/finance/TimeRangeSelector.js**
  - Period labels

- [ ] **src/components/modals/AddExpenseModal.js**
  - "Add Expense"
  - Form labels and placeholders

- [ ] **src/components/modals/TransactionDetailsModal.js**
  - Transaction detail labels

---

### 👥 User & Company Management / إدارة المستخدمين والشركات
- [ ] **src/components/super-admin/UserManagement.js**
  - "User Management"
  - "Manage all platform users and their roles"
  - "Add User"
  - "Search users..."

- [ ] **src/components/super-admin/UsersList.js**
  - Table headers
  - Action buttons

- [ ] **src/components/super-admin/UserFilters.js**
  - Filter labels

- [ ] **src/components/super-admin/modals/AddUserModal.js**
  - "Add New User"
  - Form labels

- [ ] **src/components/super-admin/modals/EditUserModal.js**
  - "Edit User"
  - Form labels

- [ ] **src/components/super-admin/CompanyManagement.js**
  - "Company Management"
  - "Manage all companies on the platform"
  - "Add Company"

- [ ] **src/components/super-admin/CompaniesList.js**
  - Table headers

- [ ] **src/components/super-admin/modals/AddCompanyModal.js**
  - "Add New Company"
  - Form labels

- [ ] **src/components/super-admin/modals/EditCompanyModal.js**
  - "Edit Company"
  - Form labels

- [ ] **src/components/super-admin/OrderManagement.js**
  - "Order Management"
  - Filter labels

---

### 📈 Constants & Status Labels / الثوابت وتسميات الحالة
- [ ] **src/constants/orderConstants.js**
  - SERVICE_TYPES names and descriptions:
    - "Furniture Moving"
    - "Cleaning Service"
    - "Painting"
    - "Packing Service"
  - LOCATION_TYPES names:
    - "Apartment"
    - "House"
    - "Office"
    - "Warehouse"
    - "Building"
  - STATUS_LABELS:
    - "Pending"
    - "In Progress"
    - "Partially Done"
    - "Completed"
    - "Cancelled"
    - "Assigned to Company"
    - "Offer Sent"
    - "Offer Accepted"
    - "Offer Rejected"
    - "Scheduled"

---

### 🎨 UI Components / مكونات واجهة المستخدم
- [ ] **src/components/LoadingSpinner.js**
  - Loading text (if any)

- [ ] **src/components/ui/Toast.js**
  - Toast message types

---

### 📝 Form Validation Messages / رسائل التحقق من النماذج
- [ ] **src/lib/validation.js**
  - All validation error messages

---

### 🔄 Order Lists & Filters / قوائم وفلاتر الطلبات
- [ ] **src/components/customer/CustomerOrdersList.js**
  - "All Orders"
  - "No orders found"
  - Filter labels

- [ ] **src/components/site-admin/SiteAdminOrdersList.js**
  - "All Orders"
  - "Manage and assign orders to companies"
  - Filter labels

- [ ] **src/components/dashboard/OrdersList.js**
  - List headers and labels

- [ ] **src/components/dashboard/OrdersFilter.js**
  - Filter options

---

### 📄 Other Components / مكونات أخرى
- [ ] **src/components/driver/DriverOrdersList.js**
  - List labels

- [ ] **src/components/worker/WorkerJobsList.js**
  - List labels

- [ ] **src/components/QuickActions.js**
  - Action labels

- [ ] **src/components/PerformanceMetrics.js**
  - Metric labels

- [ ] **src/components/StaffOverview.js**
  - Overview labels

- [ ] **src/components/VehicleStatus.js**
  - Status labels

---

## 📊 Summary / الملخص

### Total Components to Translate / إجمالي المكونات للترجمة
- **Pages**: 7 main dashboard pages
- **Modals**: 8+ modal components
- **Order Steps**: 4 step components
- **Order Cards**: 5+ card components
- **Finance Components**: 7+ components
- **Admin Components**: 10+ components
- **Navigation**: Sidebar, Notifications
- **Constants**: Order constants, status labels
- **Forms**: All form labels and validation messages

### Priority Order / ترتيب الأولوية
1. **High Priority** / أولوية عالية:
   - Login page
   - Sidebar navigation
   - Order modals and steps
   - Order status labels
   - Common buttons and labels

2. **Medium Priority** / أولوية متوسطة:
   - Dashboard pages
   - Order cards and lists
   - Notifications

3. **Lower Priority** / أولوية منخفضة:
   - Finance components
   - Admin management components
   - Utility components

---

## 🚀 Next Steps / الخطوات التالية

1. Start with common translations (buttons, labels, messages)
2. Translate Sidebar navigation
3. Translate Login page
4. Translate Order flow (modals, steps, cards)
5. Translate Dashboard pages
6. Translate remaining components
7. Test all languages
8. Verify RTL for Arabic

