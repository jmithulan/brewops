import { useState } from 'react';

// Common validation functions to eliminate duplication

export const validators = {
  required: (message = 'This field is required') => (value) => 
    !value || (typeof value === 'string' && !value.trim()) ? message : '',

  email: (message = 'Please enter a valid email address') => (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? message : '';
  },

  phone: (message = 'Please enter a valid phone number') => (value) => {
    if (!value) return '';
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return !phoneRegex.test(value) ? message : '';
  },

  minLength: (min, message) => (value) => {
    if (!value) return '';
    return value.length < min ? (message || `Must be at least ${min} characters`) : '';
  },

  maxLength: (max, message) => (value) => {
    if (!value) return '';
    return value.length > max ? (message || `Must be no more than ${max} characters`) : '';
  },

  numeric: (message = 'Must be a valid number') => (value) => {
    if (!value) return '';
    return isNaN(value) || Number(value) <= 0 ? message : '';
  },

  positiveNumber: (message = 'Must be a positive number') => (value) => {
    if (!value) return '';
    const num = Number(value);
    return isNaN(num) || num <= 0 ? message : '';
  },

  nicNumber: (message = 'Please enter a valid NIC number') => (value) => {
    if (!value) return '';
    const nicRegex = /^(\d{9}[vVxX]|\d{12})$/;
    return !nicRegex.test(value) ? message : '';
  },

  bankAccount: (message = 'Bank account must be 6-20 digits') => (value) => {
    if (!value) return '';
    const accountRegex = /^\d{6,20}$/;
    return !accountRegex.test(value) ? message : '';
  },

  password: (message = 'Password must be at least 6 characters') => (value) => {
    if (!value) return '';
    return value.length < 6 ? message : '';
  },

  confirmPassword: (originalPassword, message = 'Passwords do not match') => (value) => {
    if (!value) return '';
    return value !== originalPassword ? message : '';
  },
};

// Common validation patterns for forms
export const formValidators = {
  user: {
    name: [validators.required('Name is required'), validators.minLength(2, 'Name must be at least 2 characters')],
    email: [validators.email()],
    phone: [validators.phone()],
    password: [validators.password()],
    role: [validators.required('Role is required')],
  },

  supplier: {
    name: [validators.required('Name is required'), validators.minLength(2, 'Name must be at least 2 characters')],
    contactNumber: [validators.required('Contact number is required'), validators.phone()],
    nicNumber: [validators.required('NIC number is required'), validators.nicNumber()],
    address: [validators.required('Address is required'), validators.minLength(10, 'Address must be at least 10 characters')],
    bankAccountNumber: [validators.required('Bank account number is required'), validators.bankAccount()],
    bankName: [validators.required('Bank name is required')],
    rate: [validators.required('Rate is required'), validators.positiveNumber('Rate must be a positive number')],
  },

  delivery: {
    supplier: [validators.required('Supplier is required')],
    quantity: [validators.required('Quantity is required'), validators.positiveNumber('Quantity must be greater than 0')],
    ratePerKg: [validators.required('Rate per kg is required'), validators.positiveNumber('Rate must be greater than 0')],
    deliveryDate: [validators.required('Delivery date is required')],
  },

  inventory: {
    inventoryId: [validators.required('Inventory ID is required')],
    quantity: [validators.required('Quantity is required'), validators.numeric('Quantity must be a valid number')],
  },
};

// Generic form validation function
export const validateForm = (data, validators) => {
  const errors = {};
  
  Object.keys(validators).forEach(field => {
    const fieldValidators = validators[field];
    const value = data[field];
    
    for (const validator of fieldValidators) {
      const error = validator(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return errors;
};

// Custom hook for form validation
export const useFormValidation = (initialData = {}, validators = {}) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field) => {
    const fieldValidators = validators[field] || [];
    const value = data[field];
    
    for (const validator of fieldValidators) {
      const error = validator(value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }
    
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  };

  const validateAll = () => {
    const newErrors = validateForm(data, validators);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setData(initialData);
    setErrors({});
  };

  return {
    data,
    errors,
    updateField,
    validateField,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};
