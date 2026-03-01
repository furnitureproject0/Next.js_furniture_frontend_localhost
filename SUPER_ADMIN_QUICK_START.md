# Super Admin Dashboard - Quick Start Guide

## ✅ What's Been Implemented

### Complete API Integration for Super Admin Dashboard
**Base URL:** `http://159.198.70.32:5000/api`

---

## 📋 Features by Tab

### 1️⃣ **Users Tab** ✅
**Endpoint:** `GET /users-v2/admin/get-users`

**Features:**
- ✅ Fetch all users with pagination
- ✅ Search users by name/email/phone
- ✅ Filter by role (super_admin, site_admin, company_admin, driver, worker, client)
- ✅ Create new users (`POST /users-v2/admin/create-user`)
- ✅ Edit user details (`PATCH /users-v2/admin/update-user/{id}`)
- ✅ Delete users (`DELETE /users-v2/admin/delete-user/{id}`)
- ✅ Loading states & error handling
- ✅ Toast notifications for actions

**How to Use:**
```bash
1. Go to http://localhost:3000/super-admin?tab=users
2. Type in search box to find users
3. Click "Add User" to create new user
4. Click edit icon to modify user
5. Click delete icon to remove user
```

---

### 2️⃣ **Orders Tab** ✅
**Endpoint:** `GET /orders-v2/`

**Features:**
- ✅ Fetch all orders
- ✅ Search orders by ID/customer/address
- ✅ Filter by status (pending, assigned, in-progress, completed, cancelled)
- ✅ View order details with nested services
- ✅ Cancel orders (`PATCH /orders-v2/{id}/cancel`)
- ✅ Real-time status updates
- ✅ Order stats dashboard

**How to Use:**
```bash
1. Go to http://localhost:3000/super-admin?tab=orders
2. Use search to find specific orders
3. Use status dropdown to filter
4. Click "Cancel Order" button to cancel
5. View order details by clicking on order
```

---

### 3️⃣ **Companies Tab** ✅
**Endpoint:** `GET /companies`

**Features:**
- ✅ Fetch all companies
- ✅ Search companies by name/email
- ✅ Filter by status and type
- ✅ Create new company (`POST /companies`)
- ✅ Edit company info (`PATCH /companies/{id}`)
- ✅ Activate company (`PATCH /companies/{id}/activate`)
- ✅ Suspend company (`PATCH /companies/{id}/suspend`)
- ✅ View company details

**How to Use:**
```bash
1. Go to http://localhost:3000/super-admin?tab=companies
2. Search for companies
3. Click "Add Company" button
4. Use Activate/Suspend buttons to toggle status
5. Click edit to modify company details
```

---

## 🏗️ Architecture Overview

```
Frontend Components
    ↓
    ├── UserManagement.js
    ├── OrderManagement.js
    └── CompanyManagement.js
         ↓
    Redux Store (slices)
    ├── usersSlice.js
    ├── ordersSlice.js
    └── companiesSlice.js
         ↓
    Service Layer
    ├── superAdminService.js
    ├── superAdminTransformers.js
         ↓
    API Layer (api.js)
    ├── usersV2Api
    ├── siteAdminApi
    └── companiesApi
         ↓
    Backend API
    (http://159.198.70.32:5000/api)
```

---

## 📁 Key Files

### Service Layer (`src/lib/services/`)
- **superAdminService.js** - All API calls for super admin
- **superAdminTransformers.js** - Data transformation functions

### Redux State (`src/store/slices/`)
- **usersSlice.js** - User state management
- **companiesSlice.js** - Company state management
- **ordersSlice.js** - Order state management

### Components (`src/components/super-admin/`)
- **UserManagement.js** - Users tab
- **OrderManagement.js** - Orders tab
- **CompanyManagement.js** - Companies tab

### UI Components
- **UsersList.js** - User cards display
- **OrdersList.js** - Order cards display
- **CompaniesList.js** - Company cards display

### Modals
- **AddUserModal.js** / **EditUserModal.js** - User CRUD
- **AddCompanyModal.js** / **EditCompanyModal.js** - Company CRUD

---

## 🔌 API Endpoints Reference

### Users Endpoints
```
GET    /users-v2/admin/get-users                  # List users
GET    /users-v2/admin/get-users?search=query     # Search users
POST   /users-v2/admin/create-user                # Create user
PATCH  /users-v2/admin/update-user/{id}          # Update user
DELETE /users-v2/admin/delete-user/{id}          # Delete user
```

### Orders Endpoints
```
GET    /orders-v2/                                # List all orders
GET    /orders-v2/?search=query                   # Search orders
GET    /orders-v2/?status=pending                 # Filter by status
GET    /orders-v2/{id}                            # Get order details
PATCH  /orders-v2/{id}/cancel                     # Cancel order
```

### Companies Endpoints
```
GET    /companies                                  # List companies
GET    /companies?search=query                    # Search companies
GET    /companies/{id}                            # Company details
POST   /companies                                  # Create company
PATCH  /companies/{id}                            # Update company
PATCH  /companies/{id}/activate                   # Activate company
PATCH  /companies/{id}/suspend                    # Suspend company
```

---

## ⚙️ Environment Setup

### 1. Install Dependencies (if needed)
```bash
npm install axios
```

### 2. Set API Base URL
In `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://159.198.70.32:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Navigate to Super Admin
```
http://localhost:3000/super-admin
```

---

## 🧪 Testing Checklist

### Users Tab
- [ ] Page loads with list of users
- [ ] Search works (try entering a name)
- [ ] Role filter works
- [ ] "Add User" button opens modal
- [ ] Can create user with valid data
- [ ] Can edit user details
- [ ] Can delete user
- [ ] Error messages show for invalid operations
- [ ] Success toast shows after operations

### Orders Tab
- [ ] Page loads with list of orders
- [ ] Search works (try order ID or customer name)
- [ ] Status filter works
- [ ] Can cancel order
- [ ] Order status updates in real-time
- [ ] Stats cards show current day data
- [ ] Error messages handle API failures

### Companies Tab
- [ ] Page loads with list of companies
- [ ] Search works (try company name)
- [ ] Type/Status filters work
- [ ] "Add Company" button opens modal
- [ ] Can create company
- [ ] Can edit company details
- [ ] Can activate/suspend company
- [ ] Activate/suspend buttons update immediately

---

## 🐛 Troubleshooting

### Issue: Page shows "Failed to fetch users"
**Solution:**
1. Check if backend is running on `http://159.198.70.32:5000`
2. Check browser console for CORS errors
3. Verify you're logged in as super_admin
4. Try refreshing page

### Issue: Search is too slow
**Solution:**
- Search has 500ms debounce (intentional)
- Try being more specific in search term

### Issue: Modal doesn't close after creating item
**Solution:**
1. Check browser console for errors
2. Verify all required fields are filled
3. Try refreshing page

### Issue: Can't activate/suspend company
**Solution:**
1. Check if company status is correct
2. Verify you have super_admin permission
3. Check backend API is responding

---

## 📊 Data Structure Examples

### User Object
```javascript
{
  id: "123",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  role: "client",
  company: "Acme Corp",
  status: "active",
  created: "2025-03-01T10:00:00Z",
  lastLogin: "2025-03-01T14:30:00Z"
}
```

### Order Object
```javascript
{
  id: "ORD456",
  customer: "Jane Smith",
  service: "Moving Service",
  status: "pending",
  date: "2025-03-05",
  fromAddress: "123 Main St",
  toAddress: "456 Oak Ave",
  price: 500,
  currency: "CHF"
}
```

### Company Object
```javascript
{
  id: "COMP789",
  name: "Premium Movers",
  email: "info@movers.com",
  phone: "+1987654321",
  url: "https://movers.com",
  type: "Furniture Moving",
  status: "active",
  available: true,
  services: ["Local Moving", "Long Distance"],
  joined: "2/1/2025",
  lastActivity: "3/1/2025"
}
```

---

## 🚀 Performance Notes

- **Search Debounce:** 500ms (prevents excessive API calls)
- **Pagination:** Supported by API (set limit/page in filters)
- **Caching:** Redux stores data until refresh or manual dispatch
- **Loading:** Shows spinner only on initial load, preserves data during refresh

---

## 🔐 Security

- ✅ All requests use HTTPS/TLS
- ✅ CORS properly configured
- ✅ Bearer token authentication
- ✅ Role-based access control
- ✅ Input validation on forms
- ✅ No sensitive data in localStorage

---

## 📝 Form Validation

### User Form
- Name: Required, non-empty
- Email: Required, valid email format
- Password: Required (for new users), min 6 chars (edit optional)
- Phone: Optional, valid format
- Role: Required, dropdown selection
- Status: Required, dropdown selection

### Company Form
- Name: Required, non-empty
- Email: Required, valid email format
- Phone: Optional, valid format
- URL: Optional, valid URL format
- Type: Required, dropdown selection

### Order Form
- All order operations handled by backend
- Cancel requires optional reason field

---

## 🔄 Data Refresh

Manual refresh of data:
```javascript
// In component
import { fetchAllUsers } from "@/store/slices/usersSlice";

dispatch(fetchAllUsers()); // Refresh users
```

Automatic refresh:
- On tab change
- After successful create/update/delete operation
- When filters change (debounced)

---

## 💡 Tips & Tricks

1. **Quick Search:** Use order ID or email for fastest results
2. **Batch Operations:** Plan to create multiple users? Fill form and repeat
3. **Filter Combinations:** Can't combine search + filters currently (API limitation)
4. **Status Toggle:** Companies can quick toggle between active/suspended
5. **Keyboard Shortcuts:** Tab key for form navigation

---

## 📞 Support

For issues or questions:
1. Check browser console for error details
2. Review Redux DevTools to see state
3. Check Network tab to see API requests
4. Verify backend is running
5. Refer to [SUPER_ADMIN_API_INTEGRATION.md](./SUPER_ADMIN_API_INTEGRATION.md) for detailed info

---

**Status:** ✅ **All Features Implemented and Ready to Use**

Last Updated: March 1, 2025
API Base URL: http://159.198.70.32:5000/api
