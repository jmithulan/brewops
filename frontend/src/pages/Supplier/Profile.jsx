import React, { useState, useEffect } from "react";
import axios from "axios";
import NavigationBar from "../../components/navigationBar";
import SupplierSidebar from "../../components/SupplierSidebar";
import Footer from "../../components/Footer";
import Spinner from "../../components/Spinner";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showSupplyRecords, setShowSupplyRecords] = useState(false);
  const [supplyRecords, setSupplyRecords] = useState([]);
  const [loadingSupply, setLoadingSupply] = useState(false);
  const [errorSupply, setErrorSupply] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", profileImage: ""
  });
  
  // Fixed password form with correct field names
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });

  // Cleanup preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewImg) {
        URL.revokeObjectURL(previewImg);
      }
    };
  }, [previewImg]);

  // Fetch profile once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        
        // Use consistent token key - check what you're using in login
        const token = localStorage.getItem("jwtToken");
        
        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        // Fixed endpoint to match backend route
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          // Backend returns { success: true, profile: {...} }
          const profileData = data.profile;
          setUser(profileData);
          setForm({
            name: profileData.name || "", 
            email: profileData.email || "", 
            phone: profileData.phone || "",
            address: profileData.address || "", 
            profileImage: profileData.avatar || ""
          });
        } else {
          setError(data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (err.response?.status === 401) {
          setError("Your session has expired. Please login again.");
          localStorage.removeItem("jwtToken");
          // Optionally redirect to login
          // window.location.href = '/login';
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchSupplyRecords = async () => {
    try {
      setLoadingSupply(true);
      setErrorSupply("");
      
      const token = localStorage.getItem("jwtToken");
      
      // This endpoint needs to be created in backend if it doesn't exist
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/supply-records`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setSupplyRecords(data.records || []);
        setShowSupplyRecords(true);
      } else {
        setErrorSupply(data.message || "Failed to load supply records");
      }
    } catch (err) {
      console.error("Supply records fetch error:", err);
      setErrorSupply("Failed to load supply records.");
    } finally {
      setLoadingSupply(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      const token = localStorage.getItem("jwtToken");
      
      // Handle image upload first if there's a new image
      if (form.profileImageFile) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("profileImage", form.profileImageFile);
          
          const imageResponse = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/profile/upload-avatar`,
            imageFormData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
          
          if (!imageResponse.data.success) {
            throw new Error(imageResponse.data.message || "Failed to upload image");
          }
          
          // Update form with new avatar URL
          setForm(prev => ({
            ...prev,
            profileImage: imageResponse.data.profile.avatar,
            profileImageFile: null
          }));
          
        } catch (imageError) {
          console.error("Image upload error:", imageError);
          setError(imageError.response?.data?.message || "Failed to upload profile image");
          setLoading(false);
          return;
        }
      }
      
      // Now update profile data (excluding image since it's already uploaded)
      const profileData = {
        name: form.name,
        phone: form.phone,
        address: form.address
      };
      
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
        profileData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (data.success) {
        setSuccessMessage("Profile updated successfully!");
        setEditMode(false);
        setUser(data.profile);
        setPreviewImg(null); // Clear preview
        // Update form with new data
        setForm({
          name: data.profile.name || "", 
          email: data.profile.email || "", 
          phone: data.profile.phone || "",
          address: data.profile.address || "", 
          profileImage: data.profile.avatar || ""
        });
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update profile. Please try again.");
      }
      // Reset preview image on error
      setPreviewImg(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    // Validate password length
    if (passwordForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      const token = localStorage.getItem("jwtToken");
      
      // Fixed endpoint and payload structure
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile/change-password`,
        { 
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setSuccessMessage("Password updated successfully!");
        setPasswordMode(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Password change error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", disabled, value, onChange }) => (
    <div>
      <label className="block font-semibold">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-2 border rounded-lg ${disabled ? "bg-gray-100" : "bg-white"}`}
      />
    </div>
  );

  const PasswordInputField = ({ label, name, value, onChange }) => (
    <div>
      <label className="block font-semibold">{label}</label>
      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded-lg bg-white"
        required
      />
    </div>
  );

  if (loading && !user) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="flex flex-1">
        <SupplierSidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          {user && (
            <div className="bg-gray-200/90 rounded-xl shadow-lg p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <img
                  src={previewImg || form.profileImage || "/default-avatar.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-black"
                />
                {editMode && (
                  <div className="mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            setError('Please select a valid image file');
                            return;
                          }
                          
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Image size should be less than 5MB');
                            return;
                          }
                          
                          // Clear any previous errors
                          setError('');
                          
                          // Create preview and store file
                          const previewUrl = URL.createObjectURL(file);
                          setPreviewImg(previewUrl);
                          setForm(prev => ({ ...prev, profileImageFile: file }));
                        }
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {previewImg && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImg(null);
                          setForm(prev => ({ ...prev, profileImageFile: null }));
                          // Reset file input
                          const fileInput = document.querySelector('input[type="file"]');
                          if (fileInput) fileInput.value = '';
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove selected image
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="Name" 
                  name="name" 
                  disabled={!editMode}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <InputField 
                  label="Email" 
                  name="email" 
                  type="email" 
                  disabled={true} // Email should always be disabled
                  value={form.email}
                  onChange={() => {}} // No-op since it's disabled
                />
                <InputField 
                  label="Phone" 
                  name="phone" 
                  disabled={!editMode}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <InputField 
                  label="Address" 
                  name="address" 
                  disabled={!editMode}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-4 flex-wrap">
                {!editMode ? (
                  <>
                    <button 
                      onClick={() => {
                        setEditMode(true);
                        setError("");
                        setSuccessMessage("");
                      }} 
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={fetchSupplyRecords} 
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      View Supply Records
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button 
                      onClick={() => {
                        setEditMode(false);
                        setError("");
                        setSuccessMessage("");
                        setPreviewImg(null); // Clear preview image
                        // Reset form to original values
                        setForm({
                          name: user.name || "", 
                          email: user.email || "", 
                          phone: user.phone || "",
                          address: user.address || "", 
                          profileImage: user.avatar || "",
                          profileImageFile: null
                        });
                        // Reset file input
                        const fileInput = document.querySelector('input[type="file"]');
                        if (fileInput) fileInput.value = '';
                      }} 
                      className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              {/* Change Password */}
              <div className="mt-8 border-t pt-4">
                {!passwordMode ? (
                  <button 
                    onClick={() => {
                      setPasswordMode(true);
                      setError("");
                      setSuccessMessage("");
                    }} 
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-4">
                    <PasswordInputField 
                      label="Current Password" 
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                    <PasswordInputField 
                      label="New Password" 
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                    <PasswordInputField 
                      label="Confirm New Password" 
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                    <div className="flex gap-4">
                      <button 
                        onClick={handleChangePassword}
                        disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                      <button 
                        onClick={() => {
                          setPasswordMode(false);
                          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          setError("");
                          setSuccessMessage("");
                        }} 
                        className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supply Records */}
          {showSupplyRecords && (
            <div className="mt-10 bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
              <h2 className="text-2xl font-bold mb-4">Supply Records</h2>
              {loadingSupply ? (
                <p>Loading supply records...</p>
              ) : errorSupply ? (
                <p className="text-red-600">{errorSupply}</p>
              ) : supplyRecords.length === 0 ? (
                <p>No supply records found.</p>
              ) : (
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 border">Date</th>
                      <th className="px-4 py-2 border">Supplier</th>
                      <th className="px-4 py-2 border">Product</th>
                      <th className="px-4 py-2 border">Quantity</th>
                      <th className="px-4 py-2 border">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplyRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{new Date(rec.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 border">{rec.supplierName}</td>
                        <td className="px-4 py-2 border">{rec.productName}</td>
                        <td className="px-4 py-2 border">{rec.quantity}</td>
                        <td className="px-4 py-2 border">{rec.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}