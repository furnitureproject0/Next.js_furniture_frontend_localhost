// Form validation utilities

export const validateEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePassword = (password) => {
	return password && password.length >= 6;
};

export const validateRequired = (value) => {
	return value && value.trim().length > 0;
};

export const validatePasswordMatch = (password, confirmPassword) => {
	return password === confirmPassword;
};

export const validateBirthdate = (birthdate) => {
	if (!birthdate) return false;

	const date = new Date(birthdate);
	const today = new Date();
	const minAge = new Date(
		today.getFullYear() - 13,
		today.getMonth(),
		today.getDate(),
	);

	return date <= minAge;
};

export const getValidationErrors = (formData, isLogin = true) => {
	const errors = {};

	// Email validation
	if (!validateRequired(formData.email)) {
		errors.email = "Email is required";
	} else if (!validateEmail(formData.email)) {
		errors.email = "Please enter a valid email address";
	}

	// Password validation
	if (!validateRequired(formData.password)) {
		errors.password = "Password is required";
	} else if (!validatePassword(formData.password)) {
		errors.password = "Password must be at least 6 characters long";
	}

	// Registration-specific validations
	if (!isLogin) {
		// Name validation
		if (!validateRequired(formData.name)) {
			errors.name = "Full name is required";
		}

		// Confirm password validation
		if (!validateRequired(formData.confirmPassword)) {
			errors.confirmPassword = "Please confirm your password";
		} else if (
			!validatePasswordMatch(formData.password, formData.confirmPassword)
		) {
			errors.confirmPassword = "Passwords do not match";
		}

		// Birthdate validation
		if (!validateRequired(formData.birthdate)) {
			errors.birthdate = "Birthdate is required";
		} else if (!validateBirthdate(formData.birthdate)) {
			errors.birthdate = "You must be at least 13 years old";
		}
	}

	return errors;
};
