import { createContext, useEffect, useState } from "react";
import API from "@/api/axios";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 
  const loadUser = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user || null);
    } catch (err) {
      console.warn("No logged-in user:", err?.response?.data || err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  
  const login = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", formData, { withCredentials: true });
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  
  const signup = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/signup", formData, { withCredentials: true });

      return {
        success: true,
        tempId: res.data.tempId,
        message: res.data.message,
      };

    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  
  const verifyOtp = async ({ tempId, otp }) => {
    setLoading(true);
    setError("");

    try {
      const res = await API.post(
        "/auth/verify-otp",
        { tempId, otp },
        { withCredentials: true }
      );

      setUser(res.data.user); 

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  
  const resendOtp = async (tempId) => {
    try {
      const res = await API.post("/auth/resend-otp", { tempId });
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Could not resend OTP";
      return { success: false, message: msg };
    }
  };

 
  const logout = async () => {
    try {
      await API.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
      toast.success("Logged out successfully.")
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error(err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        login,
        logout,
        signup,
        verifyOtp,
        resendOtp,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
