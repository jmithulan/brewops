import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/authcontext';
import { toast } from 'react-hot-toast';
import { handleSuccess, handleApiError } from '../utils/errorHandler.jsx';

const ProfileImageUpload = ({ currentAvatar, onImageUpdate, onUploadStart, onUploadEnd, className = "" }) => {
  const { uploadProfileImage } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        handleApiError(new Error('Invalid file type'), 'Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        handleApiError(new Error('File too large'), 'Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload image
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    if (onUploadStart) onUploadStart();
    
    try {
      // Convert file to base64 for simple upload
      const base64 = await fileToBase64(file);
      const result = await uploadProfileImage({ avatar: base64 });
      
      if (result.success) {
        handleSuccess('Profile image updated successfully!');
        if (onImageUpdate) {
          onImageUpdate(result.user.avatar);
        }
        setPreview(null);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      handleApiError(error, error.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
      if (onUploadEnd) onUploadEnd();
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayImage = preview || currentAvatar;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <div 
          className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors overflow-hidden"
          onClick={handleClick}
        >
          {displayImage ? (
            <img 
              src={displayImage} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="text-gray-500 text-4xl">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        
        <div className="absolute -bottom-2 -right-2 bg-green-600 text-white rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      
      <p className="text-sm text-gray-600 text-center">
        Click to upload a new profile image
        <br />
        <span className="text-xs text-gray-500">Max size: 5MB</span>
      </p>
    </div>
  );
};

export default ProfileImageUpload;
