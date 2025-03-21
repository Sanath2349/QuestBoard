import React from "react";

function QuestCard({ quest, onAccept, onBoost, hasBoosted }) {
  return (
    <div className="bg-parchment-100 border  border-yellow-300 p-4 rounded-md m-2 md:m-10 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <h3 className="text-lg font-bold text-orange-600">{quest.title}</h3>
      <p className="text-gray-300">{quest.description}</p>
      <p className="mt-2 text-gray-100">
        Reward: {quest.coins} QC, {quest.xp} XP
      </p>
      <div className="flex gap-2 mt-2 justify-between">
        <button
          onClick={() => onBoost(quest.id)}
          className={`px-4 py-2 rounded flex items-center gap-1 ${
            hasBoosted
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "border-2 border-blue-600 text-white hover:bg-blue-400 animate-pulse"
          }`}
          disabled={hasBoosted}
        >
          🔥 {quest.boost_score || 0} Ups
        </button>
        <button
          onClick={() => onAccept(quest.id)}
          className={`px-4 py-2 rounded ${
            quest.status === "accepted"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-violet-600 text-white hover:bg-violet-400"
          }`}
          disabled={quest.status === "accepted"}
        >
          {quest.status === "accepted" ? "Accepted" : "Accept"}
        </button>
      </div>
    </div>
  );
}

export default QuestCard;
