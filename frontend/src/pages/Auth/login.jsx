import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import loginAnimation from "../../assets/login.json";
import Lottie from "lottie-react";
import Spinner from "../../components/Spinner.jsx";
import { useAuth } from "../../contexts/authcontext.jsx";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Set this to match the current frontend port
  const currentPort = window.location.port || "5175";

  useEffect(() => {
    // Reduce artificial loading delay
    const timer = setTimeout(() => {
      setLoadingPage(false);
    }, 300); // Reduced from 800ms to 300ms
    return () => clearTimeout(timer);
  }, []);

  if (loadingPage) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  function validateLoginForm() {
    const newErrors = {};
    let isValid = true;
    
    // Email/Username validation
    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required";
      toast.error("Please enter your email or username", {
        duration: 3000,
        position: "top-right",
      });
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
      toast.error("Please enter your password", {
        duration: 3000,
        position: "top-right",
      });
      isValid = false;
    } else if (password.length < 6) {
      // This is just a client-side check - server will enforce actual requirements
      newErrors.password = "Password must be at least 6 characters";
      toast.error("Password must be at least 6 characters", {
        duration: 3000,
        position: "top-right",
      });
      isValid = false;
    }

    // Set form errors state
    setErrors(newErrors);
    return isValid;
  }

  async function handleLogin() {
    // Prevent login attempts if form isn't valid
    if (!validateLoginForm()) {
      return;
    }

    setLoadingPage(true);
    try {
      // Check if input is email or username
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername.trim());
      const loginIdentifier = emailOrUsername.trim();
      
      // Perform login request with sanitized inputs
      const result = await login(loginIdentifier, password, !isEmail);

      if (result.success) {
        // Show customized message based on role
        let roleDisplay = "User";
        let redirectPath = "/dashboard";
        
        if (result.effectiveRole === "admin" && result.role === "manager") {
          roleDisplay = "Manager (with Admin access)";
          redirectPath = "/admin-dashboard";
        } else if (result.role === "manager") {
          roleDisplay = "Manager";
          redirectPath = "/admin-dashboard";
        } else if (result.role === "staff") {
          roleDisplay = "Staff";
          redirectPath = "/staff-dashboard";
        } else if (result.role === "supplier") {
          roleDisplay = "Supplier";
          redirectPath = "/supplier-dashboard";
        }
        
        // Show success message
        toast.success(`Welcome, ${result.user?.name || ""}! Logged in as ${roleDisplay}`, {
          duration: 3000,
          position: "top-center",
        });

        // Brief delay before navigation for better UX
        setTimeout(() => {
          // Navigate to role-specific dashboard
          navigate(redirectPath);
        }, 500);
      } else {
        // Enhanced error messaging for login failures
        if (result.message?.toLowerCase().includes("invalid")) {
          toast.error("Invalid username/email or password", {
            duration: 4000,
            position: "top-center",
          });
        } else if (result.message?.toLowerCase().includes("inactive")) {
          toast.error("Your account is inactive. Please contact support.", {
            duration: 5000,
            position: "top-center",
          });
        } else {
          toast.error(result.message || "Login failed", {
            duration: 4000,
            position: "top-center",
          });
        }
      }
    } catch (e) {
      console.error("Login error:", e);
      
      // Specific error handling based on error type
      if (e.response?.status === 429) {
        toast.error("Too many login attempts. Please try again later.", {
          duration: 5000,
          position: "top-center",
        });
      } else {
        toast.error("Connection error. Please check your network and try again.", {
          duration: 4000,
          position: "top-center",
        });
      }
    } finally {
      setLoadingPage(false);
    }
  }

  function handleGoogleSignIn() {
    // Redirect to backend Google OAuth route
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';
    console.log("Using backend URL for Google OAuth:", backendUrl);
    
    // Use the current frontend URL for the redirect
    const frontendUrl = `${window.location.protocol}//${window.location.host}`;
    console.log("Current frontend URL:", frontendUrl);
    
    // Store the frontend URL in localStorage so the backend can use it for the redirect
    localStorage.setItem('frontendUrl', frontendUrl);
    
    const googleAuthUrl = `${backendUrl}/api/auth/google?redirect_url=${encodeURIComponent(frontendUrl)}`;
    window.location.href = googleAuthUrl;
  }

  return (
    <>
      <Toaster />
      <div className="w-full h-screen bg-gray-50 bg-center bg-cover flex justify-evenly items-center">
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-[1300px] h-[600px] backdrop-blur-sm rounded-[20px] shadow-xl flex overflow-hidden">
            {/* Left half */}
            <div className="w-1/2 h-full flex flex-col items-center text-center bg-green-100 p-8">
              <h1 className="text-5xl font-bold text-green-600 mt-10">
                Welcome
              </h1>

              <p className="text-md text-green-600 mt-4">
                Don't have an account yet?{" "}
                <br />
                <a href="/register">
                  <button
                    type="button"
                    className="mt-2 px-4 py-1 text-md rounded-full border border-green-600 bg-transparent hover:bg-black text-green-600 hover:text-white hover:border-black cursor-pointer font-semibold transition"
                  >
                    Register here
                  </button>
                </a>
              </p>

              {/* Animation below register */}
              <div className="w-full max-w-[300px] mt-6">
                <Lottie animationData={loginAnimation} loop={true} />
              </div>
            </div>

            {/* Right half */}
            <div className="w-1/2 h-full bg-white flex flex-col justify-center items-center p-6">
              <h1 className="text-green-800 text-4xl font-bold mb-6">Log In</h1>

              <div className="w-[400px]">
                <input
                  type="text"
                  placeholder="Username or Email"
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  value={emailOrUsername}
                  className={`w-full h-[50px] border rounded-[20px] my-[10px] px-4 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800 ${
                    errors.emailOrUsername ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.emailOrUsername && (
                  <p className="text-red-500 text-sm">{errors.emailOrUsername}</p>
                )}
              </div>

              <div className="w-[400px] relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className={`w-full h-[50px] border rounded-[20px] my-[10px] px-4 bg-transparent text-green-800 autofill:bg-transparent autofill:text-green-800 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-800 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="w-[400px] flex justify-between items-center text-sm text-green-800 mt-2 mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="appearance-none w-4 h-4 border border-gray-300 rounded bg-transparent checked:bg-[#1cbb3f] checked:border-[#1cbb3f] transition-colors duration-200 cursor-pointer "
                    style={{
                      backgroundImage: rememberMe
                        ? "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22white%22><path d=%22M7.629 15.314L3.314 11l1.414-1.414L7.629 12.486l7.643-7.643 1.414 1.414z%22/></svg>')"
                        : "none",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      backgroundSize: "70%",
                    }}
                  />
                  <span className="text-green-800">Remember Me</span>
                </label>
                <span
                  className="text-green-800 hover:underline cursor-pointer"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot your password?
                </span>
              </div>

              {/* Log In Button */}
              <button
                onClick={handleLogin}
                className="w-[400px] h-[50px] bg-green-800 rounded-[20px] text-[18px] font-bold text-white hover:bg-black hover:text-white cursor-pointer transition"
              >
                Log In
              </button>

              {/* Divider */}
              <div className="flex items-center w-[400px] my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="text-gray-400 text-sm px-2">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                className="w-[400px] h-[50px] flex items-center justify-center gap-3 border border-gray-300 rounded-[20px] text-green-800 hover:bg-gray-300 hover:text-black transition cursor-pointer"
              >
                <FcGoogle size={22} /> Log in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


