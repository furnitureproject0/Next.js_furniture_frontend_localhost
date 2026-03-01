# Super Admin API Integration - Complete Implementation Guide

## Overview
This document provides a comprehensive guide to the Super Admin dashboard API integration with the backend. All three tabs (Users, Orders, Companies) are fully integrated with proper error handling, loading states, and data transformations.

## Base URL
```
http://159.198.70.32:5000/api
```

---

## Project Structure

### 1. Service Layer
**Location:** `src/lib/services/`

#### `superAdminService.js`
Complete service layer organized into three main sections:
- **userService**: User management operations
- **orderService**: Order management operations  
- **companyService**: Company management operations

#### `superAdminTransformers.js`
Data transformation utilities ensuring consistent data format:
- `transformUser()` / `transformUsers()` - Convert backend user format to frontend
- `transformOrder()` / `transformOrders()` - Convert backend order format to frontend
- `transformCompany()` / `transformCompanies()` - Convert backend company format to frontend
- `extractArrayData()` / `extractSingleData()` - Extract data from various API response formats

### 2. Redux Integration
**Location:** `src/store/slices/`

#### `usersSlice.js`
- **fetchAllUsers**: Fetch users with search/filters
- **createUserThunk**: Create new user
- **updateUserThunk**: Update user details
- **deleteUserThunk**: Delete user
- Integrated transformers for consistent data shape
- Full error handling and loading states

#### `companiesSlice.js`
- **fetchAllCompanies**: Fetch all companies
- **createCompanyThunk**: Create new company
- **updateCompanyThunk**: Update company
- **activateCompanyThunk**: Activate suspended company
- **suspendCompanyThunk**: Suspend active company
- Proper state management with loading/error states

#### `ordersSlice.js`
- **fetchSiteAdminOrders**: Fetch all orders (for super admin)
- **cancelOrderThunk** (alias for cancelOrder): Cancel orders
- Comprehensive order transformation
- Support for nested service details and additions

### 3. Frontend Components
**Location:** `src/components/super-admin/`

#### Management Components
- **UserManagement.js** - User list with search/filters
- **OrderManagement.js** - Order list with status/search filters
- **CompanyManagement.js** - Company list with type/status filters

#### List Components (Display)
- **UsersList.js** - Renders user cards with edit/delete actions
- **OrdersList.js** - Renders order cards with cancel action
- **CompaniesList.js** - Renders company cards with activate/suspend actions

#### Modal Components
- **AddUserModal.js** - Create new user
- **EditUserModal.js** - Edit existing user
- **AddCompanyModal.js** - Create new company
- **EditCompanyModal.js** - Edit existing company

#### Filter Components
- **UserFilters.js** - Filter by role
- **OrderFilters.js** - Filter by status/service
- **CompanyFilters.js** - Filter by type/status

---

## API Integration Details

### User Management

#### Endpoints
```
GET    /users-v2/admin/get-users              # Fetch all users
GET    /users-v2/admin/get-users?search=...   # Search users
POST   /users-v2/admin/create-user            # Create user
PATCH  /users-v2/admin/update-user/{id}      # Update user
DELETE /users-v2/admin/delete-user/{id}      # Delete user
```

#### Data Flow
1. **Frontend Search/Filter**: User enters search or changes role filter
2. **Debounce (500ms)**: Prevents excessive API calls
3. **Redux Thunk**: `fetchAllUsers()` called with filters
4. **API Request**: `usersV2Api.getUsers(filters)`
5. **Data Transformation**: Response mapped using `transformUser()`
6. **Redux State**: Users stored in `state.users.users`
7. **Component Render**: UsersList receives transformed users

#### Response Format
```javascript
{
  success: true,
  data: [
    {
      id: "user_id",
      user_name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      user_role: "client",
      company_name: "Acme Corp",
      status: "active",
      date_added: "2025-03-01T10:00:00Z",
      last_login: "2025-03-01T14:30:00Z"
    }
  ]
}
```

#### Transformed Format (Frontend)
```javascript
{
  id: "user_id",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  role: "client",
  company: "Acme Corp",
  companyId: "company_id",
  status: "active",
  created: "2025-03-01T10:00:00Z",
  lastLogin: "2025-03-01T14:30:00Z"
}
```

---

### Order Management

#### Endpoints
```
GET    /orders-v2/                        # Fetch all orders
GET    /orders-v2/?search=...             # Search orders
GET    /orders-v2/?status=...             # Filter by status
GET    /orders-v2/{id}                    # Get order details
PATCH  /orders-v2/{id}/cancel             # Cancel order
```

#### Data Flow
1. **Component Mount**: `fetchSiteAdminOrders()` dispatched on mount
2. **Optional Filters**: Status and search filters applied
3. **Redux Thunk**: Processes API response and transforms nested data
4. **Service Details**: Orders include full service details and additions
5. **State Storage**: Transformed orders in `state.orders.orders`
6. **Component Display**: OrdersList renders filtered orders

#### Order Response Structure
```javascript
{
  success: true,
  data: {
    orders: [
      {
        id: "order_id",
        customer_name: "Jane Smith",
        status: "pending",
        scheduled_date: "2025-03-05",
        location: { address: "123 Main St" },
        destination_location: { address: "456 Oak Ave" },
        orderServices: [
          {
            id: "service_id",
            service: { name: "Moving Service" },
            status: "pending",
            offers: [
              {
                price: 500,
                hourly_rate: 50,
                currency: "CHF"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### Cancel Order
- Endpoint: `PATCH /orders-v2/{id}/cancel`
- Dispatch: `dispatch(cancelOrderThunk({ orderId, reason }))`
- State Update: Order status updated to "cancelled"

---

### Company Management

#### Endpoints
```
GET    /companies                     # Fetch all companies
GET    /companies?search=...          # Search companies
GET    /companies/{id}                # Get company details
POST   /companies                     # Create company
PATCH  /companies/{id}                # Update company
PATCH  /companies/{id}/activate       # Activate company
PATCH  /companies/{id}/suspend        # Suspend company
```

#### Data Flow
1. **Component Mount**: `fetchAllCompanies()` dispatched
2. **Search Integration**: Search query filters companies
3. **Status Toggle**: Activate/suspend buttons call appropriate thunks
4. **State Update**: Companies list updated immediately
5. **Toast Notification**: Success/error messages shown to user

#### Company Response
```javascript
{
  success: true,
  data: {
    companies: [
      {
        id: "company_id",
        name: "Premium Movers",
        email: "info@movers.com",
        phones: [{ number: "+1234567890" }],
        url: "https://movers.com",
        type: "Furniture Moving",
        status: "active",
        services: [{ name: "Local Moving" }],
        createdAt: "2025-02-01T00:00:00Z",
        updatedAt: "2025-03-01T00:00:00Z"
      }
    ]
  }
}
```

#### Transformed Format
```javascript
{
  id: "company_id",
  name: "Premium Movers",
  email: "info@movers.com",
  phone: "+1234567890",
  url: "https://movers.com",
  type: "Furniture Moving",
  status: "active",
  available: true,
  services: ["Local Moving"],
  serviceCount: 1,
  employees: 0,
  createdAt: "2025-02-01T00:00:00Z",
  joined: "2/1/2025",
  lastActivity: "3/1/2025"
}
```

---

## Error Handling Strategy

### Global Error Pattern
```javascript
try {
  const response = await apiRequest(...);
  
  if (response?.success && response?.data) {
    return transformData(response.data);
  }
  
  return rejectWithValue(error?.message || "Operation failed");
} catch (error) {
  console.error("Error:", error);
  return rejectWithValue(error?.message || "Network error occurred");
}
```

### Component Error Display
```javascript
{isLoading && allUsers.length === 0 ? (
  <LoadingSpinner />
) : error ? (
  <ErrorAlert message={error} />
) : (
  <UsersList users={users} />
)}
```

### Toast Notifications
```javascript
try {
  await dispatch(thunk(data)).unwrap();
  showToast("Success!", "success");
} catch (error) {
  showToast(error?.message || "Operation failed", "error");
}
```

---

## Loading States

### Initial Load
- Set `isLoading: true` when thunk is pending
- Show spinner while `isLoading === true && data.length === 0`

### Refresh Load
- Keep existing data visible while loading new data
- Update data when fulfilled

### Per-Action Loading
- Individual action loading shown on card
- Disabled state on button during action

---

## Pagination (Future Enhancement)

Currently supported by API but not fully implemented in UI:
```javascript
// Add pagination to filters
const response = await api.getUsers({
  search: query,
  page: 1,
  limit: 20
});
```

---

## Search & Filter Implementation

### Debounced Search
```javascript
useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    dispatch(fetchAllUsers({ 
      search: searchQuery || undefined,
      role: roleFilter !== "all" ? roleFilter : undefined
    }));
  }, 500); // 500ms delay

  return () => clearTimeout(delayDebounceFn);
}, [dispatch, searchQuery, roleFilter]);
```

### Frontend Filtering (Optional)
Additional frontend filtering can be applied for better UX:
```javascript
const filteredUsers = allUsers.filter(user => 
  user.role === selectedRole && user.name.includes(searchQuery)
);
```

---

## Authentication & Authorization

### Role-Based Access
- Super admin only: Full access to all CRUD operations
- API validates user role server-side
- Frontend components check role before showing actions

### Bearer Token
- Automatically included in all requests via middleware
- Credentials included in CORS requests
- Refresh token handling done at API level

---

## Best Practices Implemented

✅ **Separation of Concerns**
- Service layer handles API calls
- Transformers handle data shape conversion
- Redux handles state management
- Components focus on UI

✅ **Error Handling**
- Try-catch blocks in all async operations
- User-friendly error messages
- Console logging for debugging

✅ **Performance**
- Debounced search (500ms)
- Efficient re-renders with selectors
- Lazy loading of modals

✅ **Code Organization**
- Service layer in `src/lib/services/`
- Consistent naming conventions
- Reusable transformer functions

✅ **Type Safety Patterns**
- Consistent prop names across components
- Null/undefined checks in transformers
- Fallback values for optional fields

---

## Testing the Integration

### 1. Test User Management
```
1. Navigate to Super Admin → Users tab
2. Search for users (e.g., "john")
3. Filter by role (e.g., "driver")
4. Click "Add User" button
5. Fill form and submit
6. Edit user by clicking edit button
7. Delete user by clicking delete button
```

### 2. Test Order Management
```
1. Navigate to Super Admin → Orders tab
2. Search for orders (e.g., "order123")
3. Filter by status (e.g., "pending")
4. Click cancel to cancel an order
5. Verify error/success toast notifications
```

### 3. Test Company Management
```
1. Navigate to Super Admin → Companies tab
2. Search for companies (e.g., "movers")
3. Click "Add Company" to create new company
4. Edit company details
5. Activate/Suspend company using action buttons
```

---

## Troubleshooting

### Issue: No users/orders/companies displayed
**Solution**: 
- Check network tab in browser DevTools
- Verify user has super_admin role
- Check API base URL configuration

### Issue: API 401 Unauthorized
**Solution**:
- Login again (token may be expired)
- Check browser cookies for auth token
- Verify CORS settings on backend

### Issue: Search not working
**Solution**:
- Check debounce delay (500ms)
- Verify search query is not empty
- Check API supports search parameter

### Issue: Modal doesn't close after submit
**Solution**:
- Check form validation passes
- Verify no error in console
- Check `.unwrap()` is called in try block

---

## Environment Configuration

```javascript
// src/lib/api.js
const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  // Development: Use Next.js proxy
  if (typeof window !== "undefined" && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  // Production
  return "http://159.198.70.32:5000/api";
};
```

Set in `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://159.198.70.32:5000/api
```

---

## Summary of Files Modified/Created

### Created Files:
- `src/lib/services/superAdminService.js` - Service layer
- `src/lib/services/superAdminTransformers.js` - Data transformers

### Modified Files:
- `src/store/slices/usersSlice.js` - Added transformers
- `src/store/slices/companiesSlice.js` - Added transformers
- `src/store/slices/ordersSlice.js` - Added cancelOrderThunk alias

### Existing Components (Already Integrated):
- `src/components/super-admin/UserManagement.js`
- `src/components/super-admin/OrderManagement.js`
- `src/components/super-admin/CompanyManagement.js`
- All list and modal components

---

## API Documentation Links

- Backend: `http://159.198.70.32:5000/api`
- Docs: Check backend `BACKEND_ENDPOINTS.md`

For additional questions or issues, refer to the error messages in browser console and check the Redux DevTools extension.
