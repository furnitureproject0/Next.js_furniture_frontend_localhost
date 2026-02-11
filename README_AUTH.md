# Authentication Integration

This document explains the authentication system integrated into the login page.

## Features

-   **Modern UI/UX**: Clean, elegant design with glass morphism effects
-   **Real-time Validation**: Form validation with immediate feedback
-   **Toast Notifications**: Beautiful toast messages for user feedback
-   **Loading States**: Proper loading indicators during API calls
-   **Error Handling**: Comprehensive error handling with user-friendly messages
-   **Authentication Context**: Global state management for user authentication
-   **Protected Routes**: Component for protecting authenticated routes

## Components Created

### 1. API Layer (`src/lib/api.js`)

-   Centralized API configuration
-   Authentication endpoints (login, register, logout, getMe)
-   Error handling with custom ApiError class
-   Cookie-based authentication support

### 2. Toast System

-   `src/components/ui/Toast.js`: Toast notification component
-   `src/hooks/useToast.js`: Hook for managing toast notifications
-   Support for success, error, warning, and info messages

### 3. Authentication Context (`src/contexts/AuthContext.js`)

-   Global authentication state management
-   Login, register, and logout functions
-   User session persistence
-   Authentication status checking

### 4. Form Validation (`src/lib/validation.js`)

-   Reusable validation utilities
-   Email, password, and other field validations
-   Age verification for registration

### 5. UI Components

-   `src/components/ui/LoadingSpinner.js`: Loading spinner component
-   `src/components/ProtectedRoute.js`: Route protection component

## API Integration

The system integrates with your backend API endpoints:

-   `POST /auth/login` - User login
-   `POST /auth/register` - User registration
-   `GET /auth/logout` - User logout
-   `GET /auth/me` - Get current user info

## Environment Configuration

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Usage

### Basic Login/Register Form

The login page (`src/app/login/page.js`) now includes:

-   Form validation with real-time feedback
-   API integration with your backend
-   Toast notifications for success/error messages
-   Loading states during API calls
-   Automatic redirection after successful authentication

### Using Authentication Context

```javascript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
	const { user, isAuthenticated, login, logout } = useAuth();

	// Use authentication state and methods
}
```

### Protecting Routes

```javascript
import ProtectedRoute from "@/components/ProtectedRoute";

function Dashboard() {
	return (
		<ProtectedRoute>
			<div>Protected content here</div>
		</ProtectedRoute>
	);
}
```

### Using Toast Notifications

```javascript
import { useToast } from "@/hooks/useToast";

function MyComponent() {
	const { toast } = useToast();

	const handleSuccess = () => {
		toast.success("Operation completed successfully!");
	};

	const handleError = () => {
		toast.error("Something went wrong!");
	};
}
```

## Form Validation

The system includes comprehensive form validation:

-   **Email**: Valid email format required
-   **Password**: Minimum 6 characters
-   **Name**: Required for registration
-   **Confirm Password**: Must match password
-   **Birthdate**: Must be at least 13 years old

## Error Handling

-   Network errors are handled gracefully
-   API errors display the server message
-   Form validation errors show field-specific messages
-   Loading states prevent multiple submissions

## Styling

The design uses:

-   Tailwind CSS for styling
-   Glass morphism effects
-   Smooth animations and transitions
-   Responsive design
-   Modern color scheme with amber/orange gradients

## Best Practices Implemented

1. **Security**: Cookie-based authentication with HttpOnly cookies
2. **UX**: Real-time validation and feedback
3. **Performance**: Optimized re-renders and API calls
4. **Accessibility**: Proper form labels and error messages
5. **Code Organization**: Modular, reusable components
6. **Error Handling**: Comprehensive error management
7. **State Management**: Clean separation of concerns

## Next Steps

1. Add password strength indicator
2. Implement forgot password functionality
3. Add social login options
4. Implement email verification
5. Add two-factor authentication
6. Create user profile management
