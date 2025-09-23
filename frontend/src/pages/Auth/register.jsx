import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import registerAnimation from "../../assets/register.json"; 
import Spinner from "../../components/Spinner.jsx";
import { useAuth } from "../../contexts/authcontext.jsx";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "", // Initialize phone with an empty string to avoid uncontrolled to controlled warning
    supplierId: "",
    staffId: "",
    managerId: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  // Update form state helper
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (form.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    // Email validation with stronger regex
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation with international format support
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{10,15}$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)";
    }

    // Password strength validation
    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = "Password must contain uppercase, lowercase and numbers";
    }

    // Confirm password
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role validation
    if (!form.role) {
      newErrors.role = "Please select a role";
    }

    // Role-specific validations
    if (form.role === "supplier") {
      if (!form.supplierId.trim()) {
        newErrors.supplierId = "Supplier ID is required";
      } else if (!/^[A-Z0-9]{6,10}$/.test(form.supplierId.trim())) {
        newErrors.supplierId = "Supplier ID must be 6-10 characters (uppercase letters and numbers only)";
      }
    }

    if (form.role === "staff") {
      if (!form.staffId.trim()) {
        newErrors.staffId = "Staff ID is required";
      } else if (!/^[A-Z]{2}[0-9]{4,6}$/.test(form.staffId.trim())) {
        newErrors.staffId = "Staff ID format: 2 uppercase letters followed by 4-6 numbers (e.g., ST123456)";
      }
    }

    if (form.role === "manager") {
      if (!form.managerId.trim()) {
        newErrors.managerId = "Manager ID is required";
      } else if (!/^M[A-Z][0-9]{6}$/.test(form.managerId.trim())) {
        newErrors.managerId = "Manager ID format: M + uppercase letter + 6 digits (e.g., MA123456)";
      }
    }

    // Display toast for the first error to guide the user
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstErrorField = errorKeys[0];
      toast.error(`${newErrors[firstErrorField]}`, {
        duration: 4000,
        position: "top-right",
      });
    }

    setErrors(newErrors);
    return errorKeys.length === 0;
  }

  async function handleRegister() {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare registration payload with sanitized data
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        employeeId: form.role === "supplier" 
          ? form.supplierId.trim() 
          : form.role === "staff" 
            ? form.staffId.trim() 
            : form.managerId.trim(),
      };

      // Log registration attempt (can be removed in production)
      console.log("Registration attempt:", { ...payload, password: '[REDACTED]' });

      // Attempt to register user
      const result = await register(payload);

      if (result.success) {
        // Clear form data for security
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "",
          phone: "",
          supplierId: "",
          staffId: "",
          managerId: "",
        });
        
        // Show success message with role-specific details
        let roleDisplay = "User";
        if (form.role === "manager") {
          roleDisplay = "Manager (with Admin access)";
        } else if (form.role) {
          roleDisplay = form.role.charAt(0).toUpperCase() + form.role.slice(1);
        }
        
        toast.success(`Registration Successful! You've registered as a ${roleDisplay}. Please login.`, {
          duration: 4000,
          position: "top-center",
        });
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        // Handle specific registration errors
        if (result.message?.includes("already exists") || result.message?.includes("already registered")) {
          toast.error("This email is already registered. Please login instead.", {
            duration: 4000,
            position: "top-center",
          });
        } else if (result.message?.includes("ID")) {
          toast.error(result.message || "Invalid ID format", {
            duration: 4000,
            position: "top-center",
          });
        } else {
          toast.error(result.message || "Registration failed", {
            duration: 4000,
            position: "top-center",
          });
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      
      // Handle network or unexpected errors
      if (error.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your internet connection.", {
          duration: 4000,
          position: "top-center",
        });
      } else {
        toast.error("An unexpected error occurred. Please try again later.", {
          duration: 4000,
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster />
      <div className="w-full h-screen bg-gray-50 bg-center bg-cover flex justify-evenly items-center">
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-[1300px] h-[650px] backdrop-blur-sm rounded-[20px] shadow-xl flex overflow-hidden">
            {/* Left half */}
            <div className="w-1/2 h-full flex flex-col items-center text-center bg-green-100 p-8">
              <h1 className="text-5xl font-bold text-green-600 mt-10">Join Us!</h1>

              <p className="text-md text-green-600 mt-4">
                Already have an account? <br />
                <a href="/login">
                  <button
                    type="button"
                    className="mt-2 px-4 py-1 text-md rounded-full border border-green-600 bg-transparent hover:bg-black text-green-600 hover:text-white hover:border-black font-semibold transition"
                  >
                    Login here
                  </button>
                </a>
              </p>

              {/* Animation */}
              <div className="w-full max-w-[300px] mt-6">
                <Lottie animationData={registerAnimation} loop={true} />
              </div>
            </div>

            {/* Right half */}
            <div className="w-1/2 h-full bg-white flex flex-col justify-center items-center p-6 overflow-auto">
              <h1 className="text-green-900 text-4xl font-bold mb-6">Register</h1>

              {/* Name */}
              <div className="w-[400px]">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  aria-label="Full Name"
                  disabled={loading}
                  className="w-full h-[50px] border border-gray-300 rounded-[20px] my-[10px] px-4 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="w-[400px]">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  aria-label="Email Address"
                  disabled={loading}
                  className="w-full h-[50px] border border-gray-300 rounded-[20px] my-[10px] px-4 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="w-[400px]">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  aria-label="Phone Number"
                  disabled={loading}
                  className="w-full h-[50px] border border-gray-300 rounded-[20px] my-[10px] px-4 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800"
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div className="w-[400px] relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  aria-label="Password"
                  disabled={loading}
                  className="w-full h-[50px] border border-gray-300 rounded-[20px] my-[10px] px-4 pr-12 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[18px] text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="w-[400px] relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  aria-label="Confirm Password"
                  disabled={loading}
                  className="w-full h-[50px] border border-gray-300 rounded-[20px] my-[10px] px-4 pr-12 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-[18px] text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>

              {/* Role Selection */}
              <div className="w-[400px]">
                <label className="block text-green-800 text-sm font-medium mb-1">Select Your Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  aria-label="Role Selection"
                  disabled={loading}
                  className="w-full h-[50px] border border-gray-300 rounded-[20px] my-[10px] px-4 bg-white text-green-800 cursor-pointer appearance-none focus:outline-none focus:border-green-500"
                >
                  <option value="" disabled>Choose a Role</option>
                  <option value="supplier">Supplier (Tea Provider)</option>
                  <option value="staff">Staff Member (Factory Worker)</option>
                  <option value="manager">Manager (Admin Access)</option>
                </select>
                {form.role === "manager" && (
                  <p className="text-amber-600 text-sm mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Managers will have administrator access to the system
                  </p>
                )}
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              </div>

              {/* Conditional fields based on role */}
              {form.role === "supplier" && (
                <div className="w-[400px]">
                  <input
                    type="text"
                    name="supplierId"
                    placeholder="Supplier ID"
                    value={form.supplierId || ""}
                    onChange={handleChange}
                    aria-label="Supplier ID"
                    disabled={loading}
                    className="w-full h-[50px] border border-gray-300 rounded-[20px] my-[10px] px-4 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800"
                  />
                  {errors.supplierId && <p className="text-red-500 text-sm">{errors.supplierId}</p>}
                </div>
              )}

              {form.role === "staff" && (
                <div className="w-[400px]">
                  <input
                    type="text"
                    name="staffId"
                    placeholder="Staff ID"
                    value={form.staffId || ""}
                    onChange={handleChange}
                    aria-label="Staff ID"
                    disabled={loading}
                    className="w-full h-[50px] border border-gray-300 rounded-[20px] my-[10px] px-4 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800"
                  />
                  {errors.staffId && <p className="text-red-500 text-sm">{errors.staffId}</p>}
                </div>
              )}

              {form.role === "manager" && (
                <div className="w-[400px]">
                  <input
                    type="text"
                    name="managerId"
                    placeholder="Manager ID"
                    value={form.managerId || ""}
                    onChange={handleChange}
                    aria-label="Manager ID"
                    disabled={loading}
                    className="w-full h-[50px] border border-gray-300 rounded-[20px] my-[10px] px-4 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800"
                  />
                  {errors.managerId && <p className="text-red-500 text-sm">{errors.managerId}</p>}
                </div>
              )}

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-[400px] h-[50px] bg-green-800 rounded-[20px] text-[18px] font-bold text-white hover:bg-black hover:text-white cursor-pointer transition flex items-center justify-center mt-4"
              >
                {loading ? <Spinner /> : "Register"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
