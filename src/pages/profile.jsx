// pages/Profile.jsx - Fixed with backend subscription sync
import React, { useState, useEffect,useMemo } from "react";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";
import Auth from "../components/auth";
import { tiers } from "../components/tierData.js";
import { useAuth } from "../components/context/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import apiService from "../components/services/api";

const defaultAvatar = "https://placehold.co/200x200?text=User";

export default function Profile() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "Your Name",
    email: "your.email@example.com",
    subscription: "Free",
    profilePicture: defaultAvatar,
  });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [redirectProcessed, setRedirectProcessed] = useState(false);

  const handleAuthenticated = (userData) => {
    if (userData && userData.id && typeof userData.id === 'string' && !isNaN(parseInt(userData.id))) {
      userData.id = parseInt(userData.id, 10);
    }
    login(userData);
    setUserInfo({
      id: userData?.id || "user1",
      name: userData?.name || "Your Name",
      email: userData?.email || "your.email@example.com",
      subscription: userData?.subscription || "Free",
      profilePicture: userData?.profilePicture || defaultAvatar,
    });
    setLoading(false);
    const savedRedirect = localStorage.getItem("redirectAfterLogin");
    if (savedRedirect) {
      localStorage.removeItem("redirectAfterLogin");
      navigate(`/${savedRedirect}`);
    }
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const currentPlan = useMemo(() => {
    const sub = userInfo.subscription || "Free";
    return tiers.find((tier) => tier.name.toLowerCase() === sub.toLowerCase()) || tiers[0];
  }, [userInfo.subscription]);

  useEffect(() => {
    const fetchFreshUser = async () => {
      try {
        if (user?.id) {
          const res = await apiService.auth.getCurrentUser(user.id);
          const fresh = res.data.user;

          // ตรวจสอบว่า fresh.subscription มีค่าก่อน
          const sub = fresh.subscription || "Free"; // ถ้าไม่มี subscription กำหนดเป็น "Free"
          const matchedPlan = tiers.find(
            (tier) => tier.name.toLowerCase() === sub.toLowerCase()
          );

          if (!matchedPlan) {
            console.error("❌ Subscription mismatch:", sub);
            alert("⚠️ Subscription plan not recognized: " + sub);
            return; // ป้องกันไม่ให้เกิดปัญหาต่อไป
          }

          // อัปเดตข้อมูลผู้ใช้
          setUserInfo({
            id: fresh.userID,
            name: fresh.username,
            email: fresh.email,
            subscription: sub, // ใช้ subscription ที่ได้จาก fresh
            profilePicture: fresh.profilePicture || defaultAvatar, // ถ้าไม่มีโปรไฟล์ภาพจะใช้ default
          });
        } else {
          console.error("❌ User ID not found");
          alert("User ID not found");
        }
      } catch (error) {
        console.error("Failed to fetch latest user data", error);
        alert("Failed to fetch user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && !redirectProcessed) {
      setRedirectProcessed(true);
      fetchFreshUser();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user, redirectProcessed]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
    if (errors[name] && value.trim()) {
      setErrors({ ...errors, [name]: "" });
    }
  };
  const handleUploadProfilePicture = async () => {
    try {
      const fileInput = document.getElementById("profile-picture");
      if (fileInput && fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append("profile_pic", fileInput.files[0]); // 📎 ชื่อต้องตรงกับฝั่ง Go
  
        const response = await fetch("http://localhost:8080/users/profile_picture", {
          method: "PUT",
          body: formData,
          credentials: "include", // 🔐 ส่ง cookie JWT ไปด้วย
        });
  
        if (!response.ok) throw new Error("Upload failed");
  
        const result = await response.json();
        console.log("✅ Upload success:", result);
  
        // 📥 ดึงรูปใหม่จาก backend เพื่ออัปเดตหน้า
        const res = await apiService.auth.getCurrentUser(userInfo.id);
        setUserInfo((prev) => ({
          ...prev,
          profilePicture: res.data.user.profilePicture || defaultAvatar,
        }));
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Failed to upload profile picture");
    }
  };
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo({ ...userInfo, profilePicture: reader.result });
        setFileInputKey(Date.now());
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userInfo.name || userInfo.name.trim() === "") {
      newErrors.name = "Name is required";
    }
    if (!userInfo.email || userInfo.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
  
        const formData = new FormData();
        formData.append("username", userInfo.name);
        formData.append("email", userInfo.email);
        formData.append("subscription", userInfo.subscription);
  
        const response = await fetch(`http://localhost:8080/users/${userInfo.id}`, {
          method: "PUT",
          body: formData,
          credentials: "include", // สำคัญมาก: ส่ง cookie (JWT) ไปด้วย
        });
  
        if (!response.ok) {
          const err = await response.json(); // ✅ ตรงนี้ใช้ได้เพราะประกาศแล้ว
          throw new Error(err.error || "Update failed");
        }
  
        // ถ้าอัปเดตสำเร็จ
        const data = await response.json();
        console.log("✅ Profile updated:", data);
  
        setEditMode(false);
      } catch (error) {
        console.error("Error updating profile", error);
        alert("Failed to update profile: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  

  const handleLogout = () => {
    logout();
    setUserInfo({
      name: "Your Name",
      email: "your.email@example.com",
      subscription: "Free",
      profilePicture: defaultAvatar,
    });
    setErrors({});
  };

  const handleChangePlan = () => {
    setShowPlanModal(true);
  };

  const handleSelectPlan = (tier) => {
    setSelectedTier(tier);
  };

  const confirmPlanChange = async () => {
    if (!selectedTier) return;
  
    try {
      setLoading(true);
  
      const formData = new FormData();
      formData.append("username", userInfo.name);
      formData.append("email", userInfo.email);
      formData.append("subscription", selectedTier.name);
  
      const res = await fetch(`http://localhost:8080/users/${userInfo.id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update subscription");
      }
  
      // อัปเดตหน้าให้สดใหม่
      const updatedInfo = { ...userInfo, subscription: selectedTier.name };
      setUserInfo(updatedInfo);
      login(updatedInfo);
      setSelectedTier(null);
      setShowPlanModal(false);
    } catch (error) {
      console.error("Subscription update error:", error);
      alert("Failed to change subscription: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (passwordErrors[name] && value.trim()) {
      setPasswordErrors({ ...passwordErrors, [name]: "" });
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePassword = () => {
    if (validatePasswordForm()) {
      alert("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordErrors({});
        setShowPasswordModal(false);

      }
    };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-12">
      {isAuthenticated ? (
        <Card className="w-full max-w-md bg-gray-900 border-none shadow-xl">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-semibold text-white">
                Your Profile
              </h1>
              <Button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Logout
              </Button>
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <img
                  src={userInfo.profilePicture || defaultAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
                  onError={(e) => {
                    // If image fails to load, fallback to default
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
                {editMode && (
                  <div className="absolute bottom-0 right-0">
                    <label
                      htmlFor="profile-picture"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer shadow-lg flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <input
  id="profile-picture"
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    handleProfilePictureChange(e); // เปลี่ยน preview
    handleUploadProfilePicture();  // อัปโหลดทันที
  }}
  key={fileInputKey}
/>
                    </label>
                  </div>
                )}
              </div>
              {editMode && (
                <p className="text-sm text-gray-400">
                  Click the icon to upload a new profile picture
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Name {editMode && <span className="text-red-500">*</span>}
                </label>
                <Input
                  name="name"
                  value={userInfo.name}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  required={editMode}
                  minLength={1}
                  className={`w-full bg-gray-800 border ${
                    errors.name ? "border-red-500" : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    errors.name ? "focus:ring-red-500" : "focus:ring-indigo-500"
                  }`}
                />
                {errors.name && editMode && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email {editMode && <span className="text-red-500">*</span>}
                </label>
                <Input
                  name="email"
                  type="email"
                  value={userInfo.email}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  required={editMode}
                  className={`w-full bg-gray-800 border ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    errors.email
                      ? "focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {errors.email && editMode && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password Change Button (only show when not in edit mode) */}
              {!editMode && (
                <div>
                  <Button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Change Password
                  </Button>
                </div>
              )}

              {/* Subscription Plan Section */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Current Subscription
                </h2>
                <div
                  className={`p-4 rounded-lg ${
                    currentPlan.featured
                      ? "bg-indigo-900/30 border border-indigo-500"
                      : "bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {currentPlan.name}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {currentPlan.priceMonthly}
                      </p>
                    </div>
                    <Button
                      onClick={handleChangePlan}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Change Plan
                    </Button>
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-300 text-sm mb-2">
                      {currentPlan.description}
                    </p>
                    <ul className="list-disc list-inside text-xs text-gray-300">
                      {currentPlan.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {editMode ? (
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors mt-4"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              ) : (
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors mt-4"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Auth onAuthenticated={handleAuthenticated} />
      )}

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-2xl text-white">
            <h2 className="text-2xl font-bold mb-4">Choose a New Plan</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`w-64 bg-gray-800 border p-4 rounded-xl cursor-pointer transition-all ${
                    selectedTier?.id === tier.id
                      ? "border-indigo-500 shadow-md shadow-indigo-500/30 scale-105"
                      : tier.featured
                      ? "border-yellow-500"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                  onClick={() => handleSelectPlan(tier)}
                >
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-300 mb-4">{tier.description}</p>
                  <ul className="list-disc list-inside text-sm text-gray-300 mb-4">
                    {tier.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <p className="text-lg font-semibold">{tier.priceMonthly}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedTier(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPlanChange}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                disabled={!selectedTier}
              >
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <Input
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full bg-gray-800 border ${
                    passwordErrors.currentPassword
                      ? "border-red-500"
                      : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    passwordErrors.currentPassword
                      ? "focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <Input
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full bg-gray-800 border ${
                    passwordErrors.newPassword
                      ? "border-red-500"
                      : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    passwordErrors.newPassword
                      ? "focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full bg-gray-800 border ${
                    passwordErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    passwordErrors.confirmPassword
                      ? "focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordErrors({});
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePassword}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save New Password"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}