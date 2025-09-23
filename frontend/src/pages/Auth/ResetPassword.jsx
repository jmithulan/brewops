import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle } from "react-icons/fa";
import loginAnimation from "../../assets/login.json";
import Lottie from "lottie-react";
import Spinner from "../../components/Spinner.jsx";
import axios from "axios";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [passwordReset, setPasswordReset] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get token from URL parameters
  const token = searchParams.get('token');

  useEffect(() => {
    // Check if token exists and validate it
    const validateToken = async () => {
      if (!token) {
        toast.error("Invalid password reset link", {
          duration: 4000,
          position: "top-center",
        });
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/forgot-password/verify/${token}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          setTokenValid(true);
        } else {
          toast.error("Password reset link has expired or is invalid", {
            duration: 4000,
            position: "top-center",
          });
          setTimeout(() => navigate("/forgot-password"), 2000);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        toast.error("Invalid or expired password reset link", {
          duration: 4000,
          position: "top-center",
        });
        setTimeout(() => navigate("/forgot-password"), 2000);
      } finally {
        setIsValidating(false);
        setLoadingPage(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  if (loadingPage || isValidating) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  const validatePasswords = () => {
    const newErrors = {};
    let isValid = true;

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
      toast.error("Please enter a new password", {
        duration: 3000,
        position: "top-right",
      });
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      toast.error("Password must be at least 8 characters long", {
        duration: 3000,
        position: "top-right",
      });
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number", {
        duration: 4000,
        position: "top-right",
      });
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      toast.error("Please confirm your password", {
        duration: 3000,
        position: "top-right",
      });
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      toast.error("Passwords do not match", {
        duration: 3000,
        position: "top-right",
      });
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleClearForm = () => {
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async () => {
    if (!validatePasswords()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/forgot-password/reset`,
        { 
          token,
          newPassword: password 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setPasswordReset(true);
        toast.success("Password reset successfully!", {
          duration: 5000,
          position: "top-center",
        });
      } else {
        toast.error(response.data.message || "Failed to reset password", {
          duration: 4000,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      
      if (error.response?.status === 400) {
        toast.error("Invalid or expired reset token", {
          duration: 4000,
          position: "top-center",
        });
        setTimeout(() => navigate("/forgot-password"), 2000);
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

  if (!tokenValid) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-4">This password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

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
                Create a new secure password for your account
              </p>

              {/* Animation */}
              <div className="w-full max-w-[300px] mt-6">
                <Lottie animationData={loginAnimation} loop={true} />
              </div>

              <p className="text-sm text-purple-600 mt-4">
                Back to login?{" "}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="mt-2 px-4 py-1 text-sm rounded-full border border-purple-600 bg-transparent hover:bg-purple-600 text-purple-600 hover:text-white hover:border-purple-600 cursor-pointer font-semibold transition"
                >
                  Login Page
                </button>
              </p>
            </div>

            {/* Right half */}
            <div className="w-1/2 h-full bg-white flex flex-col justify-center items-center p-6">
              {!passwordReset ? (
                <>
                  <h1 className="text-purple-800 text-4xl font-bold mb-2">Create New Password</h1>
                  <p className="text-gray-600 text-center mb-6 w-[400px]">
                    Please enter a new secure password for your account.
                  </p>

                  {/* New Password */}
                  <div className="w-[400px]">
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className={`w-full h-[50px] border rounded-[20px] my-[10px] pl-12 pr-12 bg-transparent text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                        disabled={isLoading}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-800 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
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
                      <li className={password.length >= 8 ? "text-green-600" : ""}>At least 8 characters</li>
                      <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>One uppercase letter</li>
                      <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>One lowercase letter</li>
                      <li className={/\d/.test(password) ? "text-green-600" : ""}>One number</li>
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
                </>
              ) : (
                // Password reset confirmation
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheckCircle className="text-green-500 text-4xl" />
                  </div>
                  
                  <h1 className="text-green-800 text-4xl font-bold mb-4">Password Reset!</h1>
                  
                  <p className="text-gray-600 text-center mb-6 w-[400px]">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>

                  <button
                    onClick={handleBackToLogin}
                    className="w-[400px] h-[50px] bg-green-600 rounded-[20px] text-[18px] font-bold text-white hover:bg-green-700 cursor-pointer transition"
                  >
                    Go to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}