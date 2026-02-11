# Toast Notification System - Usage Guide

## Overview
The application now has a global toast notification system that automatically handles API errors and allows manual toast notifications from any component.

## Features
- ✅ Automatic error handling for all Redux thunk rejections
- ✅ Global toast provider accessible from any component
- ✅ Support for success, error, warning, and info toast types
- ✅ Automatic filtering of auth errors (401) to prevent spam

## Usage

### 1. Automatic Error Handling (Redux Middleware)
All rejected Redux thunk actions are automatically caught and displayed as error toasts. No additional code needed!

```javascript
// This will automatically show an error toast if the API call fails
dispatch(fetchOrders()).unwrap();
```

### 2. Manual Toast Notifications

#### In React Components
```javascript
import { useGlobalToast } from "@/hooks/useGlobalToast";

function MyComponent() {
  const { toast } = useGlobalToast();

  const handleSuccess = () => {
    toast.success("Operation completed successfully!");
  };

  const handleError = () => {
    toast.error("Something went wrong!");
  };

  const handleWarning = () => {
    toast.warning("Please check your input");
  };

  const handleInfo = () => {
    toast.info("Processing your request...");
  };

  return (
    // Your component JSX
  );
}
```

#### With Success Messages After API Calls
```javascript
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useAppDispatch } from "@/store/hooks";
import { acceptOrderService } from "@/store/slices/ordersSlice";

function OrderComponent() {
  const dispatch = useAppDispatch();
  const { toast } = useGlobalToast();

  const handleAccept = async (orderServiceId) => {
    try {
      await dispatch(acceptOrderService({ orderId, orderServiceId })).unwrap();
      // Show success toast manually
      toast.success("Order service accepted successfully");
    } catch (error) {
      // Error toast is shown automatically by middleware
      // But you can also show custom error message:
      // toast.error("Custom error message");
    }
  };
}
```

### 3. Toast Types

- `toast.success(message, duration?)` - Green toast for successful operations
- `toast.error(message, duration?)` - Red toast for errors
- `toast.warning(message, duration?)` - Yellow toast for warnings
- `toast.info(message, duration?)` - Blue toast for informational messages

### 4. Default Duration
Default toast duration is 4000ms (4 seconds). You can customize it:

```javascript
toast.success("Saved!", 5000); // Show for 5 seconds
```

## Architecture

### Components
- `ToastProvider` - Global context provider for toast state
- `Toast` - Individual toast component (UI)
- `useGlobalToast` - Hook to access toast functions

### Redux Middleware
- `toastMiddleware` - Automatically catches rejected thunks and shows error toasts
- Filters out auth errors (401) to prevent notification spam

### File Structure
```
src/
  components/
    ToastProvider.js       # Global toast context provider
    ui/
      Toast.js            # Toast UI component
  hooks/
    useGlobalToast.js     # Hook to access toast functions
  store/
    middleware/
      toastMiddleware.js  # Redux middleware for auto error handling
```

## Notes

- Error toasts are automatically shown for all rejected Redux thunks
- Auth errors (401) are filtered out to prevent spam
- Success toasts should be shown manually after successful operations
- ToastProvider is already integrated in the app layout - no setup needed!

