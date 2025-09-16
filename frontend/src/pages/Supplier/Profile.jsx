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

  const [showSupplyRecords, setShowSupplyRecords] = useState(false);
  const [supplyRecords, setSupplyRecords] = useState([]);
  const [loadingSupply, setLoadingSupply] = useState(false);
  const [errorSupply, setErrorSupply] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", profileImage: ""
  });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });

  // Fetch profile once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(data);
        setForm({
          name: data.name, email: data.email, phone: data.phone,
          address: data.address, profileImage: data.profileImage || ""
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchSupplyRecords = async () => {
    try {
      setLoadingSupply(true);
      setErrorSupply("");
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/supply-records`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSupplyRecords(data);
      setShowSupplyRecords(true);
    } catch {
      setErrorSupply("Failed to load supply records.");
    } finally {
      setLoadingSupply(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "profileImageFile" && v) formData.append("profileImage", v);
        else if (k !== "profileImageFile") formData.append(k, v);
      });
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.password !== passwordForm.confirmPassword) return alert("Passwords do not match");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/change-password`,
        { password: passwordForm.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated");
      setPasswordMode(false);
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password change error:", err);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", disabled }) => (
    <div>
      <label className="block font-semibold">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        disabled={disabled}
        className={`w-full p-2 border rounded-lg ${disabled ? "bg-gray-100" : "bg-white"}`}
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPreviewImg(URL.createObjectURL(file));
                        setForm({ ...form, profileImageFile: file });
                      }
                    }}
                    className="mt-3"
                  />
                )}
              </div>

              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Name" name="name" disabled={!editMode} />
                <InputField label="Email" name="email" type="email" disabled />
                <InputField label="Phone" name="phone" disabled={!editMode} />
                <InputField label="Address" name="address" disabled={!editMode} />
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-4 flex-wrap">
                {!editMode ? (
                  <>
                    <button onClick={() => setEditMode(true)} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Edit Profile</button>
                    <button onClick={fetchSupplyRecords} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">View Supply Records</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                    <button onClick={() => setEditMode(false)} className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">Cancel</button>
                  </>
                )}
              </div>

              {/* Change Password */}
              <div className="mt-8 border-t pt-4">
                {!passwordMode ? (
                  <button onClick={() => setPasswordMode(true)} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Change Password</button>
                ) : (
                  <div className="space-y-4">
                    <InputField label="New Password" name="password" type="password" disabled={false} />
                    <InputField label="Confirm Password" name="confirmPassword" type="password" disabled={false} />
                    <div className="flex gap-4">
                      <button onClick={handleChangePassword} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Password</button>
                      <button onClick={() => setPasswordMode(false)} className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">Cancel</button>
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
