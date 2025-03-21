import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { logout, updateUser } from "../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import QuestCard from "../components/QuestCard";

function QuestDashboard() {
  const [followedUsers, setFollowedUsers] = useState([2]); //mock followed users state
  // Add state to track which quests the user has boosted
  const [boostedQuests, setBoostedQuests] = useState([]);
  // Local state for UI (no Redux needed here)
  const [activeTab, setActiveTab] = useState("trending");
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Redux: Access user data and dispatch actions
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Explanation: useSelector((state) => state.auth) accesses the 'auth' slice of your Redux store.
  // 'state.auth' contains { user, isAuthenticated, loading, error } from authSlice.
  // We destructure 'user' to get the logged-in user's data (e.g., username, xp, coins).

  const mockQuests = [
    {
      id: 1,
      title: "Slay the Bug",
      description: "Fix a pesky bug in the kingdom’s code.",
      coins: 50,
      xp: 100,
      status: "open",
      accept_count: 10,
      created_at: "2025-03-18",
      boost_score: 42, // Add this
      created_by: 2,
    },
    {
      id: 2,
      title: "Forge the API",
      description: "Build a mighty API for the realm.",
      coins: 75,
      xp: 150,
      status: "open",
      accept_count: 5,
      created_at: "2025-03-19",
      boost_score: 50, // Add this
      created_by: 3,
    },
  ];
  useEffect(() => {
    setQuests(mockQuests);
  }, [activeTab]);

  // Fetch quests on mount and when tab changes
  // useEffect(() => {
  //   const fetchQuests = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:8000/quests?sort=${activeTab}`
  //       );
  //       setQuests(response.data);
  //     } catch (err) {
  //       setError("Failed to fetch quests. Try again later.");
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchQuests();
  // }, [activeTab]);

  // Handle quest acceptance
  const handleAcceptQuest = async (questId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/quests/${questId}/accept`,
        { userId: user.id }
      );
      // Update local quests state
      setQuests(
        quests.map((quest) =>
          quest.id === questId ? { ...quest, status: "accepted" } : quest
        )
      );
      // Update user with new XP/coins from backend
      dispatch(updateUser(response.data.user));
      // Backend should return updated user data (e.g., new XP/coins)
      // For now, we'll assume it returns in the response
      // We'll update Redux user state in the next step
    } catch (err) {
      console.error("Failed to accept quest:", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    // Explanation: dispatch(logout()) calls the 'logout' action from authSlice.
    // This sets user: null and isAuthenticated: false in the Redux store,
    // which will redirect the user back to the Home page (via App.jsx logic).
  };

  const filteredQuests = quests.filter(
    (quest) => {
      if (activeTab === "following") {
        return followedUsers.includes(quest.created_by);
      }
      if (activeTab === "trending") {
        return true;
      }
      return true;
    }
    // quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    // quest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For trending, sort by boost_score
  const sortedQuests = [...filteredQuests].sort((a, b) => {
    if (activeTab === "trending") {
      return (
        b.boost_score - a.boost_score ||
        new Date(b.created_at) - new Date(a.created_at)
      );
    }
    return new Date(b.created_at) - new Date(a.created_at); // Default sort by date
  });

  // Add handleBoostQuest function
  const handleBoostQuest = async (questId) => {
    try {
      // Simulate API call (replace with real API later)
      // const response = await axios.post(
      //   `http://localhost:8000/quests/${questId}/boost`,
      //   { userId: user.id }
      // );
      if (boostedQuests.includes(questId)) {
        return; // Already boosted
      }
      setBoostedQuests([...boostedQuests, questId]);
      setQuests(
        quests.map((quest) =>
          quest.id === questId
            ? { ...quest, boost_score: (quest.boost_score || 0) + 1 }
            : quest
        )
      );
    } catch (err) {
      console.error("Failed to boost quest:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-black px-4 md:px-28 ">
      {/* Sidebar */}
      <div className="w-64 bg-brown-800 text-white  hidden md:block border-r border-white pl-4 pt-11">
        <h2 className="text-2xl font-bold mb-6">QuestBoard</h2>
        <div className="mb-6">
          <p className="text-gold-500">{user?.username}</p>
          <p>Level {user?.level}</p>
          <p>
            {user?.xp} XP | {user?.coins} QC
          </p>
        </div>
        <ul>
          {["Profile", "My Quests", "Badges"].map((option) => (
            <li key={option} className="mb-4">
              <Link
                to={`/${option.toLowerCase().replace(" ", "-")}`}
                className="w-full text-left hover:text-gold-500"
              >
                {option}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-brown-800 text-white p-4 flex justify-around border-b border-white">
          {["trending", "newly added", "following"].map((tab) => (
            <button
              key={tab}
              className={`capitalize px-4 py-2 rounded-md ${
                activeTab === tab
                  ? "bg-blue-800 text-gray-200"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Quests Grid */}
        <main className="p-4 ">
          {loading && <p className="text-center">Loading quests...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && quests.length === 0 && (
            <p className="text-center">No quests available. Check back soon!</p>
          )}
          <div className="flex flex-col gap-4">
            {sortedQuests.map((quest) => (
              <div key={quest.id} className="relative quest-card-container">
                <QuestCard
                  quest={quest}
                  onAccept={handleAcceptQuest}
                  onBoost={handleBoostQuest}
                  hasBoosted={boostedQuests.includes(quest.id)}
                />
                <button
                  onClick={() => navigate(`/profile/${quest.created_by}`)}
                  className="absolute top-2 left-6 text-orange-600 hover:underline"
                >
                  {quest.title}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
      {/* search */}
      <div className="w-64 bg-black text-white p-4 hidden md:flex flex-col gap-2 border-l border-white">
        <div className="relative">
          <input
            type="text"
            className="px-8 py-2 m-2 rounded-lg bg-transparent border border-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 w-full"
            placeholder="Search Quests"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestDashboard;
