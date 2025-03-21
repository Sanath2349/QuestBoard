import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useSelector } from "react-redux";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import QuestDashboard from "./pages/QuestDashboard";
import Profile from "./pages/Profile";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

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
          path="/profile/:userId"
          element={isAuthenticated ? <Profile /> : <Navigate to="/" />}
        />
        <Route path="/questtest" element={<QuestDashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
