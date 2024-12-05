import React from "react";
import ScoreCard from "./ScoreCard";

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-blue-800 text-white">
        <div className="text-2xl font-semibold">Cricket Scoreboard</div>
      </div>

      {/* Scoreboard */}
      <div className="flex flex-1 justify-center items-center bg-gray-100 overflow-hidden">
        <ScoreCard />
      </div>

    </div>
  );
};

export default Dashboard;
