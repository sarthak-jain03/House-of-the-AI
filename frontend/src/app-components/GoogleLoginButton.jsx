import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode"; 
import API from "@/api/axios";

const GoogleLoginButton = ({ onSuccess }) => {
  const googleBtn = useRef(null);

  useEffect(() => {
    if (!window.google) {
      console.error("Google script not loaded");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });

    if (googleBtn.current) {
      window.google.accounts.id.renderButton(googleBtn.current, {
        theme: "filled_blue",
        size: "large",
        shape: "pill",
      });
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const userObject = jwtDecode(response.credential); 

      const payload = {
        googleId: userObject.sub,
        email: userObject.email,
        name: userObject.name,
      };

      const res = await API.post("/auth/google", payload, {
        withCredentials: true,
      });

      onSuccess(res.data.user);
    } catch (error) {
      console.error("Google auth error:", error);
    }
  };

  return <div ref={googleBtn}></div>;
};

export default GoogleLoginButton;
