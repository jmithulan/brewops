import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authcontext.jsx";
import Spinner from "../../components/Spinner.jsx";
import { 
  FaUserCircle, FaEdit, FaSave, FaTimes, FaIdCard, FaEnvelope, 
  FaPhone, FaUserTag, FaKey, FaCalendarAlt, FaShieldAlt
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function UserProfile({ settingsView = false }) {
  const { user, token, logout, authError } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(settingsView); // Auto-enable edit mode in settings view
  const [activeTab, setActiveTab] = useState(settingsView ? 'settings' : 'profile');
  const [profileData, setProfileData] = useState(null);
  const [lastLogin, setLastLogin] = useState(localStorage.getItem('lastLogin') || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Use authenticated user data from context
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        effectiveRole: user.effectiveRole || user.role || "",
        employee_id: user.employee_id || ""
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, token, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      // For now just display success message as the backend isn't fully implemented
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  // Handle photo selection
  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Please select JPG, PNG, or WEBP image.");
      return;
    }

    const maxMB = 3;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`Image must be ≤ ${maxMB} MB.`);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Upload photo
  const uploadPhoto = async () => {
    if (!selectedFile) {
      toast.error("Please choose an image first.");
      return;
    }
    setSavingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);
      
      // Simulate successful upload
      setTimeout(() => {
        setProfileData(prev => ({ 
          ...prev, 
          photoUrl: URL.createObjectURL(selectedFile) 
        }));
        clearSelectedImage();
        toast.success("Photo updated successfully!");
        setSavingPhoto(false);
      }, 1500);
      
      // Actual implementation would be:
      // const { data } = await axios.post("/api/profile/upload-avatar", formData);
      // setProfileData(prev => ({ ...prev, photoUrl: data.photoUrl }));
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
      setSavingPhoto(false);
    }
  };

  // Format role name for display
  const formatRoleName = (role) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ");
  };

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Not Available</h2>
          <p className="mb-4">Unable to load your profile information.</p>
          <p className="text-sm text-gray-500 mb-4">
            {authError || "Please try logging in again or contact support if the issue persists."}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">{activeTab === 'settings' ? 'Account Settings' : 'My Profile'}</h1>
          <p className="mt-2">
            {activeTab === 'settings' ? 'Update your account preferences and information' : 'View and manage your account information'}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6">
            <button
              onClick={() => { setActiveTab('profile'); setEditMode(false); }}
              className={`py-4 px-2 font-medium border-b-2 ${
                activeTab === 'profile' 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-green-600'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => { setActiveTab('settings'); setEditMode(true); }}
              className={`py-4 px-2 font-medium border-b-2 ${
                activeTab === 'settings' 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-green-600'
              }`}
            >
              Account Settings
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-green-50 p-6 flex flex-col md:flex-row justify-between items-center border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="relative mb-4 md:mb-0">
                {profileData.photoUrl ? (
                  <img 
                    src={profileData.photoUrl} 
                    alt={profileData.name} 
                    className="w-20 h-20 rounded-full object-cover border-2 border-green-600"
                  />
                ) : previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-400"
                  />
                ) : (
                  <div className="bg-green-700 text-white rounded-full p-4 w-20 h-20 flex items-center justify-center">
                    <FaUserCircle size={50} />
                  </div>
                )}
                
                {/* Photo upload options - only shown in settings tab */}
                {activeTab === 'settings' && (
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={onPickImage}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Change photo
                    </button>
                    
                    {previewUrl && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={uploadPhoto}
                          disabled={savingPhoto}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                        >
                          {savingPhoto ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={clearSelectedImage}
                          className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="ml-0 md:ml-4 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start mt-1 gap-2">
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                    {formatRoleName(profileData.effectiveRole)}
                  </span>
                  {profileData.effectiveRole !== profileData.role && (
                    <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full font-medium">
                      {formatRoleName(profileData.role)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              {activeTab === 'profile' && !editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <FaEdit className="mr-2" /> Edit Profile
                </button>
              ) : activeTab === 'profile' && editMode ? (
                <button
                  onClick={handleSave}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <FaSave className="mr-2" /> Save Changes
                </button>
              ) : null}
              
              {/* Logout button always visible */}
              <button
                onClick={handleLogout}
                className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Profile Details Form */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FaUserCircle className="mr-2 text-green-600" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full p-3 border rounded-lg ${
                    editMode ? "border-green-300 bg-white" : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FaEnvelope className="mr-2 text-green-600" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full p-3 border rounded-lg ${
                    editMode ? "border-green-300 bg-white" : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FaPhone className="mr-2 text-green-600" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full p-3 border rounded-lg ${
                    editMode ? "border-green-300 bg-white" : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FaIdCard className="mr-2 text-green-600" /> Employee/Supplier ID
                </label>
                <input
                  type="text"
                  name="employee_id"
                  value={profileData.employee_id || ''}
                  disabled={true} // Always disabled as ID shouldn't be editable
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>

              {/* Role */}
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <FaUserTag className="mr-2 text-green-600" /> Role
                </label>
                <input
                  type="text"
                  value={formatRoleName(profileData.role)}
                  disabled={true}
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>

              {/* Effective Role - Only show if different from role */}
              {profileData.effectiveRole !== profileData.role && (
                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FaKey className="mr-2 text-green-600" /> Access Level
                  </label>
                  <input
                    type="text"
                    value={formatRoleName(profileData.effectiveRole)}
                    disabled={true}
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
              )}

              {/* Last Login */}
              {lastLogin && (
                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FaCalendarAlt className="mr-2 text-green-600" /> Last Login
                  </label>
                  <input
                    type="text"
                    value={new Date(lastLogin).toLocaleString()}
                    disabled={true}
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
              )}
            </div>

            {/* Action buttons for edit mode */}
            {editMode && (
              <div className="flex mt-6 space-x-3">
                <button
                  onClick={handleSave}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                >
                  <FaSave className="mr-2" /> Save Changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Additional Info for Profile Tab */}
          {activeTab === 'profile' && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Permissions & Access</h3>
                <p className="text-gray-600">
                  As a <strong>{formatRoleName(profileData.effectiveRole)}</strong>, you have access to various features in the system.
                </p>
                {profileData.effectiveRole !== profileData.role && (
                  <p className="mt-2 text-yellow-600">
                    <strong>Note:</strong> Your actual role is {formatRoleName(profileData.role)}, but you have {formatRoleName(profileData.effectiveRole)} access privileges.
                  </p>
                )}
              </div>
              
              <div className="mt-6">
                <p className="text-gray-600 text-sm">
                  For security reasons, some information can only be changed by administrators. 
                  Please contact support if you need to update protected fields.
                </p>
              </div>
            </div>
          )}
          
          {/* Settings Tab Content */}
          {activeTab === 'settings' && (
            <div className="border-t border-gray-200 p-6">
              {/* Security Settings Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Change Password */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <FaKey className="mr-2 text-green-600" /> Change Password
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      It's a good practice to change your password periodically to enhance account security.
                    </p>
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                      onClick={() => toast.success("This feature will be implemented soon!")}
                    >
                      Change Password
                    </button>
                  </div>
                  
                  {/* Two-Factor Authentication */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <FaShieldAlt className="mr-2 text-green-600" /> Two-Factor Authentication
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                      onClick={() => toast.success("This feature will be implemented soon!")}
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Notification Settings */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">Email Notifications</h4>
                      <p className="text-gray-600 text-sm">Receive notifications about account activity via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">System Notifications</h4>
                      <p className="text-gray-600 text-sm">Receive in-app notifications about system updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Account Management */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition"
                    onClick={() => toast.success("Account backup feature will be available soon!")}
                  >
                    <h4 className="font-medium text-gray-800 mb-2">Backup Account Data</h4>
                    <p className="text-gray-600 text-sm">Download a copy of your account data and activities</p>
                  </button>
                  
                  <button 
                    className="p-4 border border-red-200 rounded-lg hover:bg-red-50 text-left transition"
                    onClick={() => toast.error("Please contact an administrator to deactivate your account")}
                  >
                    <h4 className="font-medium text-red-600 mb-2">Deactivate Account</h4>
                    <p className="text-gray-600 text-sm">Temporarily disable your account access</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
