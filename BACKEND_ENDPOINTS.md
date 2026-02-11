# Required Backend Endpoints for Employee Management

This document outlines the backend endpoints needed to fully support employee management features, specifically rate history tracking for active employees.

## Current Implementation Status

### ✅ Currently Available Endpoints

The following endpoints are already implemented and being used:

1. **List Employees**
   - `GET /api/companies/:id/employees`
   - Query params: `page`, `limit`, `role`, `status`, `sort`
   - Returns: List of employments with user data

2. **Create Employee (New User)**
   - `POST /api/companies/:id/employees`
   - Creates both User and EmployeeCompany records
   - For: workers, drivers, company_secretary

3. **Invite Existing Employee**
   - `POST /api/companies/:id/employments`
   - Creates EmployeeCompany record (pending status)
   - For: existing workers/drivers only

4. **Update Employment (Pending Only)**
   - `PATCH /api/companies/:id/employments/:employmentId`
   - Currently only works for `status === "pending"`
   - Fields: `hourly_rate`, `currency`, `start_date`

5. **Terminate Employment**
   - `PATCH /api/companies/:id/employments/:employmentId/terminate`
   - Changes status to "terminated" and sets end_date
   - Only works for active employments

6. **Cancel Employment**
   - `PATCH /api/companies/:id/employments/:employmentId/cancel`
   - Changes status to "cancelled"
   - Only works for pending employments

---

## ❌ Missing Endpoints (Required for Full Functionality)

### 1. Update Active Employment with Rate History

**Endpoint:** `PATCH /api/companies/:companyId/employments/:employmentId/rate`

**Purpose:** Update hourly rate for active employees while maintaining history

**Request Body:**
```json
{
  "hourly_rate": 30.50,
  "currency": "CHF",
  "effective_date": "2026-01-15T00:00:00.000Z",  // Optional, defaults to now
  "notes": "Annual raise"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employment rate updated successfully",
  "data": {
    "employment": {
      "id": 123,
      "employee_id": 456,
      "company_id": 789,
      "hourly_rate": 30.50,
      "currency": "CHF",
      "status": "active",
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-11T10:30:00.000Z"
    },
    "rate_history": {
      "id": 1,
      "employment_id": 123,
      "old_rate": 25.00,
      "new_rate": 30.50,
      "currency": "CHF",
      "effective_date": "2026-01-15T00:00:00.000Z",
      "changed_by": 789,  // user_id of company_admin
      "changed_at": "2026-01-11T10:30:00.000Z",
      "notes": "Annual raise"
    }
  }
}
```

**Authorization:** 
- `company_admin` (must own the company)
- `super_admin`

**Business Logic:**
- Works for `active` employments (and optionally `pending`)
- Creates a record in `employment_rate_history` table before updating
- Updates `hourly_rate` and `currency` in `EmployeeCompany` table
- Sets `updatedAt` timestamp

---

### 2. Get Rate History for Employment

**Endpoint:** `GET /api/companies/:companyId/employments/:employmentId/rate-history`

**Purpose:** Retrieve all historical rate changes for an employment

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `sort` (optional, default: "desc" for newest first)

**Response:**
```json
{
  "success": true,
  "message": "Rate history retrieved successfully",
  "data": {
    "history": [
      {
        "id": 2,
        "employment_id": 123,
        "old_rate": 30.50,
        "new_rate": 32.00,
        "currency": "CHF",
        "effective_date": "2026-06-01T00:00:00.000Z",
        "changed_by": 789,
        "changed_by_name": "John Admin",  // Join with User table
        "changed_at": "2026-05-20T14:30:00.000Z",
        "notes": "Mid-year adjustment"
      },
      {
        "id": 1,
        "employment_id": 123,
        "old_rate": 25.00,
        "new_rate": 30.50,
        "currency": "CHF",
        "effective_date": "2026-01-15T00:00:00.000Z",
        "changed_by": 789,
        "changed_by_name": "John Admin",
        "changed_at": "2026-01-11T10:30:00.000Z",
        "notes": "Annual raise"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalItems": 2
  }
}
```

**Authorization:** 
- `company_admin` (must own the company)
- `super_admin`
- `worker/driver` (if they own the employment)

---

## Database Schema Changes

### New Table: `employment_rate_history`

```sql
CREATE TABLE employment_rate_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employment_id INT NOT NULL,
  old_rate DECIMAL(10, 2) NULL,
  new_rate DECIMAL(10, 2) NULL,
  currency VARCHAR(3) DEFAULT 'CHF',
  effective_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by INT NOT NULL,  -- user_id who made the change
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (employment_id) REFERENCES employees_companies(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_employment_id (employment_id),
  INDEX idx_changed_at (changed_at)
);
```

### Considerations

1. **Migration Strategy:**
   - Create the table
   - Optionally backfill with current rates as initial history (one entry per employment)

2. **Cascading Deletes:**
   - When an employment is deleted, all history should be deleted (CASCADE)
   - When a user is deleted, keep history but set `changed_by` to NULL (SET NULL)

3. **Validation:**
   - `new_rate` should be >= 0
   - `currency` should match employment currency (or update both)
   - `effective_date` should not be before employment `start_date`

---

## Frontend Usage

### Current Temporary Solution
The frontend currently uses **localStorage** to track rate changes locally:
- File: `src/lib/rateHistory.js`
- Functions: `addRateHistory()`, `getRateHistory()`
- Limitation: Data is device-specific and not shared across users/sessions

### After Backend Implementation
Once the backend endpoints are ready:

1. **Update `EditEmployeeModal.js`:**
   - Replace `addRateHistory()` call with API request to update endpoint
   - Use new `PATCH /rate` endpoint instead of `PATCH /employments/:id`

2. **Add Rate History Component:**
   - Fetch history from `GET /rate-history` endpoint
   - Display in modal with pagination
   - Show who changed what and when

3. **Remove localStorage:**
   - Remove `src/lib/rateHistory.js` file
   - Clean up localStorage keys from user browsers

---

## Testing Checklist

Once implemented, test the following scenarios:

- [ ] Update rate for active employee (success)
- [ ] Update rate for pending employee (success)
- [ ] Try to update rate for terminated employee (should fail)
- [ ] Fetch rate history with pagination
- [ ] Verify history is sorted by newest first
- [ ] Ensure rate history is deleted when employment is deleted
- [ ] Check authorization (non-admin cannot access)
- [ ] Verify `changed_by` is recorded correctly

---

## Priority

**High Priority** - Required for production-ready employee management

The current implementation works for basic CRUD operations, but rate history is essential for:
- Audit trails (who changed what and when)
- Payroll transparency
- Compliance requirements
- Employee communications about raises/adjustments

---

## Alternative Approach (Simpler but Less Ideal)

If full rate history is not immediately needed, you could modify the existing `updateEmployment` endpoint to:

1. Remove the `status === "pending"` restriction
2. Allow updates for active employments
3. Skip history tracking for now

**Pros:**
- Faster to implement
- No new table needed

**Cons:**
- No audit trail
- Cannot answer "what was the rate on X date?"
- Makes compliance harder

**Not recommended** for production systems handling payroll.

---

## Contact

For questions or clarifications about these requirements, please reach out to the frontend development team.
