import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import loginAnimation from "../../assets/login.json";
import Lottie from "lottie-react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    // Current password validation
    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    // New password validation
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill all fields correctly", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile/change-password`,
        {
          username,
          currentPassword,
          newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast.success("Password reset successfully!", {
          duration: 5000,
          position: "top-center",
        });
        
        // Clear form and redirect after success
        handleClearForm();
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(response.data.message || "Failed to reset password", {
          duration: 4000,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Invalid username or current password", {
          duration: 4000,
          position: "top-center",
        });
      } else if (error.response?.status === 404) {
        toast.error("User not found", {
          duration: 4000,
          position: "top-center",
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to reset password", {
          duration: 4000,
          position: "top-center",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleClearForm = () => {
    setUsername("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <>
      <Toaster />
      <div className="w-full h-screen bg-gray-50 bg-center bg-cover flex justify-evenly items-center">
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-[1300px] h-[700px] backdrop-blur-sm rounded-[20px] shadow-xl flex overflow-hidden">
            {/* Left half */}
            <div className="w-1/2 h-full flex flex-col items-center text-center bg-purple-100 p-8">
              <h1 className="text-5xl font-bold text-purple-600 mt-10">
                Reset Password
              </h1>

              <p className="text-md text-purple-600 mt-4">
                Enter your current password and create a new secure password
              </p>

              {/* Animation */}
              <div className="w-full max-w-[300px] mt-6">
                <Lottie animationData={loginAnimation} loop={true} />
              </div>

              <p className="text-sm text-purple-600 mt-4">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="mt-2 px-4 py-1 text-sm rounded-full border border-purple-600 bg-transparent hover:bg-purple-600 text-purple-600 hover:text-white hover:border-purple-600 cursor-pointer font-semibold transition"
                >
                  Back to Login
                </button>
              </p>
            </div>

            {/* Right half */}
            <div className="w-1/2 h-full bg-white flex flex-col justify-center items-center p-6">
              {/* Back button */}
              <div className="w-[400px] mb-4">
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition"
                >
                  <FaArrowLeft size={16} />
                  <span>Back to Login</span>
                </button>
              </div>

              <h1 className="text-purple-800 text-4xl font-bold mb-2">Reset Your Password</h1>
              <p className="text-gray-600 text-center mb-6 w-[400px]">
                Enter your username, current password, and create a new secure password.
              </p>

              {/* Username Input */}
              <div className="w-[400px]">
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    className={`w-full h-[50px] border rounded-[20px] my-[10px] pl-12 pr-4 bg-transparent text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Current Password Input */}
              <div className="w-[400px]">
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    value={currentPassword}
                    className={`w-full h-[50px] border rounded-[20px] my-[10px] pl-12 pr-12 bg-transparent text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.currentPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-800 focus:outline-none"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password Input */}
              <div className="w-[400px]">
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    value={newPassword}
                    className={`w-full h-[50px] border rounded-[20px] my-[10px] pl-12 pr-12 bg-transparent text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-800 focus:outline-none"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="w-[400px]">
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    className={`w-full h-[50px] border rounded-[20px] my-[10px] pl-12 pr-12 bg-transparent text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-800 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="text-sm text-gray-500 mt-2 mb-4 w-[400px]">
                <p className="mb-2 font-medium">Password requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li className={newPassword.length >= 8 ? "text-green-600" : ""}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>One uppercase letter</li>
                  <li className={/[a-z]/.test(newPassword) ? "text-green-600" : ""}>One lowercase letter</li>
                  <li className={/\d/.test(newPassword) ? "text-green-600" : ""}>One number</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="w-[400px] space-y-3">
                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-[50px] bg-purple-600 rounded-[20px] text-[18px] font-bold text-white hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed cursor-pointer transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                {/* Clear Form Button */}
                <button
                  onClick={handleClearForm}
                  disabled={isLoading}
                  className="w-full h-[50px] border border-gray-300 rounded-[20px] text-[18px] font-bold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  Clear Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}