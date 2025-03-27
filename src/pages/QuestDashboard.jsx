import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { logout, updateUser } from "../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import QuestCard from "../components/QuestCard";
import { toast } from "react-toastify";

function QuestDashboard() {
  const [followedUsers, setFollowedUsers] = useState([]); //mock followed users state
  // Add state to track which quests the user has boosted
  const [boostedQuests, setBoostedQuests] = useState([]);
  // Local state for UI (no Redux needed here)
  const [activeTab, setActiveTab] = useState("trending");
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false); // State for modal
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    coins: "",
    xp: "",
  });
  const [postLoading, setPostLoading] = useState(false);
  // Redux: Access user data and dispatch actions
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userIdFromDetails = user?.user_details?.user_id; // "UID68314463"

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

  // Fetch followed users function
  const fetchFollowedUsers = async () => {
    if (!userIdFromDetails) return; // Don't fetch if user ID isn't available yet
    try {
      const response = await axios.get(
        `https://questboard-backend.onrender.com/get_user_following_list?user_id=${userIdFromDetails}`
      );
      const followedUserIds = response.data.followers; // Assuming this returns an array of user_ids
      setFollowedUsers(followedUserIds);
    } catch (err) {
      console.error("Failed to fetch followed users:", err);
      toast.error("Failed to load followed users.", {
        style: {
          background: "#4A2C2A",
          color: "#F5E8C7",
          border: "1px solid #D4AF37",
        },
      });
    }
  };

  useEffect(() => {
    setQuests(mockQuests);
    fetch_users();
    fetchFollowedUsers();

    // Set initial followed users from the current user's data
    const currentUser = users.find((u) => u.user_id === userIdFromDetails);
    if (currentUser) {
      setFollowedUsers(currentUser.following);
    }
  }, [ userIdFromDetails]);

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

  const handlePostFormChange = (e) => {
    const { name, value } = e.target;
    setPostForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostQuest = async (e) => {
    e.preventDefault();
    console.log("popst");
    if (
      !postForm.title ||
      !postForm.description ||
      !postForm.coins ||
      !postForm.xp
    ) {
      toast.error("Please fill in all fields.", {
        style: {
          background: "#4A2C2A",
          color: "#F5E8C7",
          border: "1px solid #D4AF37",
        },
      });
      return;
    }

    setPostLoading(true);
    try {
      const newQuest = {
        title: postForm.title,
        description: postForm.description,
        coins: parseInt(postForm.coins),
        xp: parseInt(postForm.xp),
        creation_date: new Date().toISOString(),
      };

      const response = await axios.post(
        `https://questboard-backend.onrender.com/create_quests?created_by=${userIdFromDetails}&status=Open`,
        newQuest
      );
      const createdQuest = response.data;
      console.log("quest post response", response);

      // Add the new quest to the local state
      setQuests((prev) => [
        {
          ...createdQuest,
          id: createdQuest.id || Date.now(), // Use a temporary ID if the backend doesn't return one
          created_by: user.id, // Add created_by since it's in query params
          status: "Open", // Add status since it's in query params
          accept_count: 0, // Add default fields expected by QuestCard
        },
        ...prev,
      ]);

      // Reset the form and close the modal
      setPostForm({ title: "", description: "", coins: "", xp: "" });
      setIsPostModalOpen(false);

      toast.success("Quest posted successfully!", {
        style: {
          background: "#4A2C2A",
          color: "#F5E8C7",
          border: "1px solid #D4AF37",
        },
      });
    } catch (err) {
      console.error("Failed to post quest:", err);
      toast.error("Failed to post quest. Try again later.", {
        style: {
          background: "#4A2C2A",
          color: "#F5E8C7",
          border: "1px solid #D4AF37",
        },
      });
    } finally {
      setPostLoading(false);
    }
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

  const fetch_users = async () => {
    try {
      const response = await axios.get(
        "https://questboard-backend.onrender.com/fetch_users"
      );
      const usersData = response.data;
      console.log("usersData", usersData);
      setUsers(usersData);
    } catch (err) {
      console.error(err);
    }
  };

  // Add this function to handle following a user
  const handleFollowUser = async (userToFollowId) => {
    if (followedUsers.includes(userToFollowId)) {
      toast.info("You already follow this user!", {
        style: {
          background: "#4A2C2A",
          color: "#F5E8C7",
          border: "1px solid #D4AF37",
        },
      });
      return;
    }
    try {
      const response = await axios.post(
        `https://questboard-backend.onrender.com/Following_user?user_id=${userIdFromDetails}&following_id=${userToFollowId}`
      );
  
      // Update followedUsers by refetching from API
      await fetchFollowedUsers();
  
      // Update users state locally (optional, if you want immediate UI update)
      setUsers(
        users.map((u) =>
          u.user_id === userIdFromDetails
            ? { ...u, following: [...u.following, userToFollowId] }
            : u
        )
      );
  
      toast.success(response.data.message, {
        style: {
          background: "#4A2C2A",
          color: "#F5E8C7",
          border: "1px solid #D4AF37",
        },
      });
    } catch (err) {
      console.log(err)
      if (
        err.response?.status === 404 &&
        err.response?.data?.detail?.includes("you already follow")
      ) {
        setFollowedUsers([...followedUsers, userToFollowId]);
        toast.info("You already follow this user!", {
          style: {
            background: "#4A2C2A",
            color: "#F5E8C7",
            border: "1px solid #D4AF37",
          },
        });
      } else {
        console.error("Failed to follow user:", err);
        toast.error("Failed to follow user. Try again later.", {
          style: {
            background: "#4A2C2A",
            color: "#F5E8C7",
            border: "1px solid #D4AF37",
          },
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-black px-4 md:px-28 ">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white  hidden md:block border-r border-white pl-4 pt-11">
        <h2
          className="text-2xl font-bold mb-6"
          onClick={() => navigate("/dashboard")}
        >
          QuestBoard
        </h2>
        <button
          className=" font-bold mb-6 bg-white text-black p-2 rounded-md"
          onClick={() => setIsPostModalOpen(true)}
        >
          Post a Quest
        </button>
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
        <div className="bg-gray-800 p-2">
          <h1 className="text-3xl font-semibold">Users</h1>
          {users
            .filter((user) => user.user_id !== userIdFromDetails)
            .map((user) => {
              const isFollowing = followedUsers.includes(user.user_id);
              return (
                <div
                  key={user.user_id}
                  className="py-2 flex items-center justify-between"
                >
                  <h2 className="text-xl">{user.username}</h2>
                  <button
                    onClick={() =>
                      !isFollowing && handleFollowUser(user.user_id)
                    }
                    className={`px-2 py-1 rounded-md text-sm ${
                      isFollowing
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={isFollowing}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
      {/* Post Quest Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black  flex items-center justify-center z-50">
          <div className="bg-brown-800 text-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gold-500">
              Post a New Quest
            </h2>
            <form onSubmit={handlePostQuest}>
              <div className="mb-4">
                <label className="block text-sm mb-2">Quest Title</label>
                <input
                  type="text"
                  name="title"
                  value={postForm.title}
                  onChange={handlePostFormChange}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Enter quest title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  name="description"
                  value={postForm.description}
                  onChange={handlePostFormChange}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  rows="4"
                  placeholder="Describe the quest..."
                ></textarea>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm mb-2">Coins Reward</label>
                  <input
                    type="number"
                    name="coins"
                    value={postForm.coins}
                    onChange={handlePostFormChange}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., 50"
                    min="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-2">XP Reward</label>
                  <input
                    type="number"
                    name="xp"
                    value={postForm.xp}
                    onChange={handlePostFormChange}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., 100"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold-500 text-brown-800 rounded-lg hover:bg-gold-600"
                >
                  Post Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestDashboard;
