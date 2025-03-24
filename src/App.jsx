import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useSelector } from "react-redux";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import QuestDashboard from "./pages/QuestDashboard";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  console.log("App.jsx: isAuthenticated after rehydration:", isAuthenticated, user);

  return (

    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <QuestDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/" />}
        />
        <Route path="/questtest" element={<QuestDashboard/>}/>
      </Routes>\
      <ToastContainer
           position="top-right"
           autoClose={3000}
           hideProgressBar={false}
           newestOnTop={false}
           closeOnClick
           rtl={false}
           pauseOnFocusLoss
           draggable
           pauseOnHover
           theme="dark"
      />
    </Router>
  );
}

export default App;
