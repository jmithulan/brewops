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

  // Load profile
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/profile/me", { withCredentials: true })
      .then(res => setProfile(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const onPickImage = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return alert("Select JPG, PNG, or WEBP image.");
    if (file.size > 3 * 1024 * 1024) return alert("Image must be ≤ 3MB.");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelectedImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveProfile = async e => {
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

  const uploadPhoto = async () => {
    if (!selectedFile) return alert("Choose an image first.");
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

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-green-50">
      {/* Navigation Bar */}
      <nav className="bg-green-700 text-white p-4 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
        <div className="text-3xl font-bold">BreOps</div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">

          <Link to="/staff" className="hover:underline">Dashboard</Link>
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/staff/profile" className="hover:underline">Profile</Link>

        </div>
      </nav>

      {/* Profile Section */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                Edit
              </button>
            )}
          </div>
          <p className="text-gray-500 mt-1">View your details. Click edit to update.</p>

          {/* Avatar */}
          <div className="mt-6 flex flex-col md:flex-row gap-6 md:items-center">
            <div className="relative flex-shrink-0">
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
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
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
