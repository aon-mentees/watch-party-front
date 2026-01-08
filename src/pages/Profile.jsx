import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Icon from "../components/Icon";
import userService from "../services/userService";
import authService from "../services/authService";

const normalizeUser = (data) => ({
  id: data?.id || data?.userId || data?.sub,
  name: data?.fullName || data?.name,
  email: data?.email,
  phoneNumber: data?.phoneNumber,
  profilePictureUrl: data?.profilePictureUrl || data?.avatarUrl,
});

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: "", email: "", phoneNumber: "" });
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [headerProfilePicture, setHeaderProfilePicture] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const apiUser = await userService.getMe();
      const normalizedUser = normalizeUser(apiUser);
      setUser(normalizedUser);
      setProfileForm({
        fullName: normalizedUser?.name || "",
        email: normalizedUser?.email || "",
        phoneNumber: normalizedUser?.phoneNumber || "",
      });
      if (normalizedUser?.profilePictureUrl) {
        setHeaderProfilePicture(normalizedUser.profilePictureUrl);
      }
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
    } catch (error) {
      console.error("Error fetching current user:", error);
      toast.error(error?.message || "Session expired. Please login again.");
      authService.logout();
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    const cachedUserStr = localStorage.getItem("currentUser");
    if (cachedUserStr) {
      try {
        const cachedUser = normalizeUser(JSON.parse(cachedUserStr));
        setUser(cachedUser);
        setProfileForm({
          fullName: cachedUser?.name || "",
          email: cachedUser?.email || "",
          phoneNumber: cachedUser?.phoneNumber || "",
        });
        if (cachedUser?.profilePictureUrl) {
          setHeaderProfilePicture(cachedUser.profilePictureUrl);
        }
      } catch (err) {
        console.error("Error parsing cached user:", err);
      }
    }

    fetchCurrentUser();
  }, [navigate]);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updatedUser = await userService.updateProfile({
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phoneNumber: profileForm.phoneNumber.trim(),
      });
      const normalizedUser = normalizeUser(updatedUser);
      setUser(normalizedUser);
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePictureSelect = (e) => {
    const file = e.target.files?.[0];
    
    if (picturePreview && picturePreview.startsWith('blob:')) {
      URL.revokeObjectURL(picturePreview);
    }
    
    if (!file) {
      setPictureFile(null);
      setPicturePreview(null);
      return;
    }
    
    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
  };

  const handleRemovePicture = () => {
    if (picturePreview && picturePreview.startsWith('blob:')) {
      URL.revokeObjectURL(picturePreview);
    }
    
    setPictureFile(null);
    setPicturePreview(null);
    
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleProfilePictureUpload = async () => {
    if (!pictureFile) {
      toast.error("Please choose an image first");
      return;
    }

    setUploadingPicture(true);
    try {
      const updatedUser = await userService.updateProfilePicture(pictureFile);
      const normalizedUser = normalizeUser(updatedUser);
      setUser(normalizedUser);
      
      if (picturePreview && picturePreview.startsWith('blob:')) {
        URL.revokeObjectURL(picturePreview);
      }
      
      if (normalizedUser.profilePictureUrl) {
        setHeaderProfilePicture(normalizedUser.profilePictureUrl);
      }
      setPicturePreview(null);
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
      toast.success("Profile picture updated");
      setPictureFile(null);
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      toast.error(err?.message || "Failed to update profile picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      await userService.deleteAccount();
      toast.info("Account deleted. Goodbye!", {
        icon: <Icon name="wave" className="w-5 h-5" strokeWidth={2} />,
      });
      authService.logout();
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error(err?.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  if (!user && loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-4 text-white">
            <Icon name="clapper" className="w-10 h-10" strokeWidth={2} />
          </div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transition: "all 1s ease",
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <nav className="relative z-10 bg-[#0d0a12]/80 backdrop-blur-sm border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="text-white hover:text-red-400 transition-colors"
              >
                ← Home
              </button>
              <h1 className="text-xl font-bold bg-linear-to-r from-[#c41e3a] via-[#d4145a] to-[#fbb034] bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>

            <div className="flex items-center gap-4 rounded-full px-4 py-2 transition-all">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {headerProfilePicture ? (
                  <img src={headerProfilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">
                  {user?.name}
                </span>
                <span className="text-xs text-white/50 truncate">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-1.5 text-sm rounded-full bg-red-900/40 hover:bg-red-900/60 text-white transition-all border border-red-900/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Account Settings</h2>
            <p className="text-white/70">Manage your personal information and account preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="drama" className="w-6 h-6" strokeWidth={2} />
              <h3 className="text-xl font-semibold">Update Profile</h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/60">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileForm.fullName}
                  onChange={handleProfileChange}
                  disabled={savingProfile}
                  className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3 text-white placeholder:text-[#8d889d] disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/60">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  disabled={savingProfile}
                  className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3 text-white placeholder:text-[#8d889d] disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/60">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={handleProfileChange}
                  disabled={savingProfile}
                  className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3 text-white placeholder:text-[#8d889d] disabled:opacity-50"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full px-6 py-3 bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="camera" className="w-6 h-6" strokeWidth={2} />
                <h3 className="text-lg font-semibold">Profile Picture</h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#1a1520] border border-red-900/20 flex items-center justify-center overflow-hidden">
                  {picturePreview ? (
                    <img src={picturePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="user" className="w-8 h-8 text-white/60" strokeWidth={2} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureSelect}
                    disabled={uploadingPicture}
                    className="w-full text-sm text-white"
                  />
                  <p className="text-xs text-white/50 mt-1">Max size: 5MB. JPG/PNG recommended.</p>
                </div>
              </div>
              <div className="flex gap-2">
                {pictureFile && (
                  <button
                    onClick={handleRemovePicture}
                    disabled={uploadingPicture}
                    className="flex-1 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-red-900/20"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={handleProfilePictureUpload}
                  disabled={uploadingPicture}
                  className={`${pictureFile ? 'flex-1' : 'w-full'} px-4 py-2 bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                >
                  {uploadingPicture ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            <div className="bg-[#190b10] border border-red-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="warning" className="w-6 h-6 text-[#fbb034]" strokeWidth={2} />
                <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
              </div>
              <p className="text-sm text-white/60 mb-4">Delete your account and all associated data.</p>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="w-full px-4 py-2 bg-red-800 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {deletingAccount ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
