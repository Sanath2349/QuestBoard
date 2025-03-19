import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  registerStart,
  registerSuccess,
  registerFailure,
  loginSuccess,
} from "../redux/slices/authSlice";

function Home() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      dispatch(registerStart());
      try {
        // Get user info from Google
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const googleUser = res.data;
        console.log("user data", googleUser);

        // Prepare user data for backend
        const userData = {
          googleId: googleUser.sub, // Unique Google ID
          username: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          xp: 0,
          coins: 0,
          level: 1,
          badges: [],
        };

        // Send to backend (adjust URL to your FastAPI endpoint)
        const backendRes = await axios.post(
          "http://localhost:8000/register",
          userData
        );
        const registeredUser = backendRes.data;

        // Store in Redux
        dispatch(registerSuccess(registeredUser));
        navigate("/dashboard");
      } catch (err) {
        if (err.response?.data?.message === "User already exists") {
          // User exists, treat as login
          dispatch(loginSuccess(err.response.data.user)); // Assumes backend sends user data in the error response
          navigate("/dashboard");
        } else {
          dispatch(
            registerFailure(
              err.response?.data?.message ||
                err.message ||
                "Registration failed"
            )
          );
          console.error("Registration error:", err);
        }
      }
    },
    onError: (error) => {
      dispatch(registerFailure("Google login failed"));
      console.error(error);
    },
  });

//   if (isAuthenticated) {
//     return (
//       <div className="text-center p-8 text-brown-800">
//         Welcome, adventurer! Redirecting to quests...
//       </div>
//     );
//   }

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-violet-100">QuestBoard</h1>
        <p className="text-xl text-gray-100 mt-2">
          Embark on epic freelance adventures. Earn XP, coins, and glory!
        </p>
      </div>

      {/* Google Sign-In Button */}
      <div className="bg-parchment-100 p-8 rounded-lg shadow-2xl shadow-violet-300/50 w-full max-w-md ">
        <h2 className="text-2xl text-purple-100 mb-6 text-center">
          Join the Adventure
        </h2>
        <button
          onClick={() => googleLogin()}
          className="w-full bg-gold-500 text-brown-800 py-3 rounded-lg hover:bg-gold-600 flex items-center justify-center gap-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            "Loading..."
          ) : (
            <>
              <div className="flex gap-2 border-2 border-yellow-300 p-2 rounded-lg">
                <svg className="w-6 h-6" viewBox="0 0 48 48">
                  <path
                    fill="#4285F4"
                    d="M24 9.5c3.8 0 6.4 1.6 7.9 2.9l5.8-5.8C34.4 3.6 29.7 1.5 24 1.5 14.8 1.5 7.2 7.7 4.2 15.9l7.6 5.9C13.3 15.2 18.2 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 38.5c-5.7 0-10.6-4-12.1-9.7l-7.6 5.9C7.2 40.3 14.8 46.5 24 46.5c5.5 0 10.2-1.9 13.6-5.1l-6.6-5.1c-1.8 1.2-4.1 2.2-6.9 2.2z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M44.5 24c0-1.4-.1-2.7-.4-4H24v8.1h11.8c-.5 2.7-2 5-4.4 6.6l6.6 5.1c3.9-3.6 6.5-9 6.5-15.8z"
                  />
                  <path
                    fill="#EA4335"
                    d="M11.8 21.8C11.3 20.3 11 18.7 11 17c0-1.7.3-3.3.8-4.8L4.2 6.3C2.5 9.6 1.5 13.2 1.5 17c0 3.8 1 7.4 2.7 10.7l7.6-5.9z"
                  />
                </svg>
                <span className="text-purple-100">Sign in with Google</span>
              </div>
            </>
          )}
        </button>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}

export default Home;
