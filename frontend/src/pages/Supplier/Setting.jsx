// src/pages/StaffProfile.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Spinner from '../../components/Spinner';

export default function StaffProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    role: "staff",
    photoUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // ---- Load profile ----
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/profile/me", { withCredentials: true })
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // ---- Image picker ----
  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please select JPG, PNG, or WEBP image.");
      return;
    }

    const maxMB = 3;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`Image must be ≤ ${maxMB} MB.`);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelectedImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---- Save profile ----
  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put("http://localhost:5000/api/profile/me", profile, { withCredentials: true });
      alert("Profile updated ✅");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ---- Upload photo ----
  const uploadPhoto = async () => {
    if (!selectedFile) {
      alert("Please choose an image first.");
      return;
    }
    setSavingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);
      const { data } = await axios.post(
        "http://localhost:5000/api/profile/me/photo",
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      setProfile({ ...profile, photoUrl: data.photoUrl });
      clearSelectedImage();
      alert("Photo updated ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to upload photo.");
    } finally {
      setSavingPhoto(false);
    }
  };

  if (loading) return <div className="p-8">{<Spinner />}</div>;

  return (
    <div className="min-h-screen bg-green-50">
      {/* Navigation Bar */}
      <nav className="bg-green-700 text-white p-4 flex justify-between flex-wrap">
        <div className="text-3xl font-bold">BreOps</div>
        <div className="space-x-6 mt-2 md:mt-0">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/staff-profile" className="hover:underline">Profile</Link>
        </div>
      </nav>

      {/* Profile Section */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 md:p-8">
          <div className="flex justify-between items-center flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 mt-2 md:mt-0"
              >
                Edit
              </button>
            )}
          </div>
          <p className="text-gray-500 mt-1">View your details. Click edit to update.</p>

          {/* Avatar */}
          <div className="mt-6 flex flex-col md:flex-row gap-6 md:items-center">
            <div className="relative">
              <img
                src={previewUrl || profile.photoUrl || "https://via.placeholder.com/160x160?text=Avatar"}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover border border-gray-200"
              />
            </div>
            {editMode && (
              <div className="flex-1">
                <div className="flex gap-3 flex-wrap mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition shadow"
                  >
                    Choose Image
                  </button>
                  {previewUrl && (
                    <>
                      <button
                        type="button"
                        onClick={uploadPhoto}
                        disabled={savingPhoto}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow disabled:opacity-60"
                      >
                        {savingPhoto ? "Uploading..." : "Save Image"}
                      </button>
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={onPickImage}
                />
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={saveProfile} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input
                name="contact"
                value={profile.contact}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                value={profile.role}
                readOnly
                className="w-full bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 text-gray-600"
              />
            </div>

            {editMode && (
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition shadow disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
