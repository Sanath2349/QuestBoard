import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import QuestCard from "../components/QuestCard";
import { logout, updateUser } from "../redux/slices/authSlice";
import { ToastBar } from "react-hot-toast";

const Profile = () => {
  const { userId } = useParams(); // Get userdId from URL
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const userIdFromDetails = currentUser?.user_details?.user_id; // "UID68314463"
  const dispatch = useDispatch();
  // Redux Explanation: useSelector accesses the 'auth' slice to get the logged-in user (currentUser).
  // We use this to check if the logged-in user is viewing their own profile and to get their ID for follow/unfollow.
  const [profileUser, setProfileUser] = useState(null);
  const [quests, setQuests] = useState([]);
  const [activeTab, setActiveTab] = useState("posted");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [boostedQuests, setBoostedQuests] = useState([]);
  const [followers, setFollowers] = useState();
  const [following, setFollowing] = useState();
  // Mock user and quests for now (replace with API calls later)
  const mockUsers = [
    {
      id: 1,
      username: "HeroA",
      picture: "https://via.placeholder.com/50",
      xp: 200,
      coins: 150,
      level: 2,
      badges: ["Bug Slayer"],
    },
    {
      id: 2,
      username: "QuestMasterB",
      picture: "https://via.placeholder.com/50",
      xp: 300,
      coins: 200,
      level: 3,
      badges: ["API Forger"],
    },
  ];
  const mockQuests = [
    {
      id: 1,
      title: "Slay the Bug",
      description: "Fix a pesky bug in the kingdom’s code.",
      coins: 50,
      xp: 100,
      status: "open",
      boost_score: 42,
      created_by: 2,
      accepted_by: null,
    },
    {
      id: 2,
      title: "Forge the API",
      description: "Build a mighty API for the realm.",
      coins: 75,
      xp: 150,
      status: "accepted",
      boost_score: 50,
      created_by: 2,
      accepted_by: 1,
    },
  ];

  useEffect(() => {
    // Only fetch profile if currentUser exists
    if (!currentUser) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `https://questboard-backend.onrender.com/user_details?user_id=${userIdFromDetails}`
        );
        const userData = response.data; // Get the actual data from the response
        console.log("fetched user", userData);
        if (!userData) throw new Error("User not found");
        setProfileUser(userData);

        // Check if current user is following this profile, only if currentUser exists
        if (currentUser && currentUser.id) {
          setIsFollowing(userId === "2" && currentUser.id === 1); // Mock: User 1 follows User 2
        }

        setQuests(
          mockQuests.filter((q) =>
            activeTab === "posted"
              ? q.created_by === parseInt(userId)
              : q.accepted_by === parseInt(userId)
          )
        );
      } catch (err) {
        setError("Failed to load profile. Try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    get_followers();
    get_following();
  }, [userId, activeTab, currentUser]); // Remove .id from dependency array if currentUser might be undefined initially

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // await axios.delete(`http://localhost:8000/follow`, { data: { follower_id: currentUser.id, followed_id: userId } });
        setIsFollowing(false);
        toast.success(`Unfollowed ${profileUser.username}!`, {
          style: {
            background: "#4A2C2A",
            color: "#F5E8C7",
            border: "1px solid #D4AF37",
          },
        });
      } else {
        // await axios.post(`http://localhost:8000/follow`, { follower_id: currentUser.id, followed_id: userId });
        setIsFollowing(true);
        toast.success(`Now following ${profileUser.username}!`, {
          style: {
            background: "#4A2C2A",
            color: "#F5E8C7",
            border: "1px solid #D4AF37",
          },
        });
      }
    } catch (err) {
      toast.error("Failed to update follow status.", {
        style: {
          background: "#4A2C2A",
          color: "#F5E8C7",
          border: "1px solid #D4AF37",
        },
      });
    }
  };

  const handleAcceptQuest = async (questId) => {
    try {
      // const response = await axios.post(`http://localhost:8000/quests/${questId}/accept`, { userId: currentUser.id });
      setQuests(
        quests.map((quest) =>
          quest.id === questId
            ? { ...quest, status: "accepted", accepted_by: currentUser.id }
            : quest
        )
      );
      // Update user stats in Redux if needed (e.g., XP/coins)
    } catch (err) {
      console.error("Failed to accept quest:", err);
    }
  };

  const handleBoostQuest = async (questId) => {
    try {
      if (boostedQuests.includes(questId)) return;
      // const response = await axios.post(`http://localhost:8000/quests/${questId}/boost`, { userId: currentUser.id });
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

  const get_followers = async () => {
    try {
      const response = await axios.get(
        `https://questboard-backend.onrender.com/get_user_followers_list?user_id=${userIdFromDetails}`
      );
      const followerscount = response.data.followers.length;
      console.log("followers count", followerscount);
      setFollowers(followerscount);
    } catch (err) {
      setError("Failed to load profile. Try again later.");
      console.error(err);
    }
  };

  const get_following = async () => {
    try {
      const response = await axios.get(
        `https://questboard-backend.onrender.com/get_user_following_list?user_id=${userIdFromDetails}`
      );
      const followingcount = response.data.followers.length;
      console.log("following count", followingcount);
      setFollowing(followingcount);
    } catch (err) {
      setError("Failed to load profile. Try again later.");
      console.error(err);
    }
  };

  if (loading)
    return <p className="text-center text-white">Loading profile...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!profileUser)
    return <p className="text-center text-white">User not found.</p>;

  const isOwnProfile = currentUser && currentUser.id === parseInt(userId);

  return (
    <div className="flex min-h-screen bg-black px-4 md:px-28">
      {/* Sidebar (same as QuestDashboard, could extract to a component) */}
      <div className="w-64 bg-black text-white  hidden md:block border-r border-white pl-4 pt-11">
        <h2
          className="text-2xl font-bold mb-6"
          onClick={() => navigate("/dashboard")}
        >
          QuestBoard
        </h2>
        <div className="mb-6">
          <p className="text-gold-500">{currentUser?.username}</p>
          <p>Level {currentUser?.level}</p>
          <p>
            {currentUser?.xp} XP | {currentUser?.coins} QC
          </p>
        </div>
        <ul>
          {["Profile", "My Quests", "Badges"].map((option) => (
            <li key={option} className="mb-4">
              <button
                onClick={() =>
                  navigate(`/${option.toLowerCase().replace(" ", "-")}`)
                }
                className="w-full text-left hover:text-gold-500"
              >
                {option}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => {
                dispatch(logout());
                navigate("/");
              }}
              className="w-full text-left text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Profile Header */}
        <div className="bg-brown-800 text-white p-6 border-b border-white">
          <div className="flex items-center gap-4">
            <img
              src={profileUser.picture}
              alt={profileUser.username}
              className="w-16 h-16 rounded-full border-2 border-gold-500"
            />
            <div>
              <h2 className="text-2xl font-bold">{profileUser.username}</h2>
              <p>Level {profileUser.level}</p>
              <p>
                {profileUser.xp} XP | {profileUser.coins} QC
              </p>
              <div className="flex gap-2 mt-2">
                {profileUser.badges.map((badge) => (
                  <span
                    key={badge}
                    className="bg-gold-500 text-brown-800 px-2 py-1 rounded text-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* {!isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              className={`mt-4 px-4 py-2 rounded ${
                isFollowing
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )} */}
          <div className="flex gap-11 text-xl">
            <h3>Followers {followers}</h3>
            <h3>Following {following}</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-brown-800 text-white p-4 flex justify-around border-b border-white">
          {["posted", "accepted"].map((tab) => (
            <button
              key={tab}
              className={`capitalize px-4 py-2 rounded-md ${
                activeTab === tab
                  ? "bg-gold-500 text-brown-800 border-b-2 border-gold-700 shadow-md"
                  : "hover:bg-brown-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} Quests
            </button>
          ))}
        </div>

        {/* Quests Grid */}
        <main className="p-4">
          {quests.length === 0 ? (
            <p className="text-center text-white">No {activeTab} quests yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onAccept={handleAcceptQuest}
                  onBoost={handleBoostQuest}
                  hasBoosted={boostedQuests.includes(quest.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
