import { useState, useEffect } from "react";
import { FaUserAlt } from "react-icons/fa";
import axios from "axios";
import { BASE_URL } from "../utils/api";

const ProfileImage = ({ profilePicturePath, googleProfilePictureUrl, size = "medium", className = "" }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Size configurations
  const sizeClasses = {
    small: "w-10 h-10",
    medium: "w-40 h-40", 
    large: "w-48 h-48"
  };

  const iconSizes = {
    small: "w-5 h-5",
    medium: "w-16 h-16",
    large: "w-20 h-20"
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (profilePicturePath?.startsWith('http')) {
          setImageUrl(profilePicturePath);
        } else if (profilePicturePath?.startsWith('/uploads/profile/')) {
          const filename = profilePicturePath.split('/').pop();
          const response = await axios.get(`${BASE_URL}/auth/profile-image/${filename}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          });
          setImageUrl(response.data.imageUrl);
        } else if (googleProfilePictureUrl) {
          // Use Google profile picture from prop if no custom profile picture
          setImageUrl(googleProfilePictureUrl);
        } else {
          setImageUrl(null);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
        // Fallback to Google profile picture if custom picture fetch fails
        if (googleProfilePictureUrl) {
          setImageUrl(googleProfilePictureUrl);
        } else {
          setImageUrl(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (profilePicturePath || googleProfilePictureUrl) {
      fetchImage();
    } else {
      setLoading(false);
    }
  }, [profilePicturePath, googleProfilePictureUrl]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-slate-100 border border-slate-300 shadow ${sizeClasses[size]} ${className}`}>
        <div className="animate-spin rounded-full border-b-2 border-slate-500"></div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-slate-100 border border-slate-300 shadow ${sizeClasses[size]} ${className}`}>
        <FaUserAlt className={`text-slate-500 ${iconSizes[size]}`} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Profile"
      className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shadow ${className}`}
    />
  );
};

export default ProfileImage;
