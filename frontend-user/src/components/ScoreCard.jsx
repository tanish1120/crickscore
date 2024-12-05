import React, { useRef, useEffect, useState } from "react";

const ScoreCard = () => {
  const teamA = { name: "IND", score: 297, wickets: 6, overs: 20 };
  const teamB = { name: "BAN", score: 164, wickets: 7, overs: 20 };

  // 11 players in the batting team with initial 0 runs, balls, and fours
  const allBatsmen = [
    { name: "Sachin Tendulkar", runs: 0, balls: 0, fours: 0 },
    { name: "Virat Kohli", runs: 0, balls: 0, fours: 0 },
    { name: "Rohit Sharma", runs: 0, balls: 0, fours: 0 },
    { name: "Shikhar Dhawan", runs: 0, balls: 0, fours: 0 },
    { name: "KL Rahul", runs: 0, balls: 0, fours: 0 },
    { name: "Hardik Pandya", runs: 0, balls: 0, fours: 0 },
    { name: "Rishabh Pant", runs: 0, balls: 0, fours: 0 },
    { name: "MS Dhoni", runs: 0, balls: 0, fours: 0 },
    { name: "Kedar Jadhav", runs: 0, balls: 0, fours: 0 },
    { name: "Jasprit Bumrah", runs: 0, balls: 0, fours: 0 },
    { name: "Mohammad Shami", runs: 0, balls: 0, fours: 0 },
  ];

  // Initialize activeBatsmen with the first two batsmen
  const [activeBatsmen, setActiveBatsmen] = useState([allBatsmen[0], allBatsmen[1]]);
  const [strikerIndex, setStrikerIndex] = useState(0); // Index of the current striker
  const [latestMessage, setLatestMessage] = useState(""); // Empty message initially
  const [totalWickets, setTotalWickets] = useState(0); // Track total wickets
  const [commentary, setCommentary] = useState([]); // Track commentary messages
  const [balls, setBalls] = useState(0); //

  const commentaryRef = useRef(null);

  // Revert to previous bowler's stats state
  const [bowlers, setBowlers] = useState([
    { name: "Nitish Kumar Reddy", overs: 0.0, runs: 0, wickets: 0 },
  ]);

  useEffect(() => {
    // Randomly select a striker at the beginning
    const randomStriker = Math.floor(Math.random() * 2); // Select either 0 or 1 randomly
    setStrikerIndex(randomStriker);

    // Connect to WebSocket server (replace 'ws://localhost:3000' with your WebSocket server URL)
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data); // Assuming the server sends a JSON message
      console.log("Received WebSocket message:", data);

      

      // Handle runs, balls, and fours for striker
      if (["1", "2", "3", "4", "5", "6"].includes(data.option.toString())) {
        setActiveBatsmen((prevBatsmen) => {

            setBowlers((prevBowlers) => {
                const newBowlers = [...prevBowlers];
                const currentBowler = newBowlers[0]; // Assuming one bowler
              
                // Increment the number of balls bowled
                if (currentBowler.overs % 1 === 0.5) {
                  currentBowler.overs = Math.floor(currentBowler.overs) + 1; // Move to the next over
                } else {
                  currentBowler.overs += 0.1; // Increment by 0.1 for each ball
                }
              
                return newBowlers;
              });
          const newBatsmen = [...prevBatsmen];
          const currentStriker = newBatsmen[strikerIndex];

          // Increment balls for every event (only once)
          currentStriker.balls += 1;

          // Update runs based on the option (parse it to number)
          const runsScored = parseInt(data.option, 10); // Ensure it’s a number
          currentStriker.runs += runsScored; // Add the runs based on the option

          // If the option is 4, increment the fours count
          if (runsScored === 4) {
            currentStriker.fours += 1;
          }

          // Update the batsmen array
          newBatsmen[strikerIndex] = currentStriker;
          return newBatsmen;
        });

        // Add normal commentary message
        setCommentary((prevCommentary) => [
          ...prevCommentary,
          `${data.option} run to striker`,
        ]);
      }

      // Handle special cases like "No Ball", "Wide", "Catch Out", "Wicket", "Run Out"
      if (["No Ball", "Wide"].includes(data.option)) {
        setCommentary((prevCommentary) => [
          ...prevCommentary,
          `${data.option}`, // Directly add the special message
        ]);
      }

      // Handle player out event: catch out, wicket, or runout
      if (["Catch Out", "Wicket", "Run Out"].includes(data.option.toString())) {
        const currentStriker = activeBatsmen[strikerIndex];

        // Make a copy of activeBatsmen before modifying it
        const newBatsmenArray = [...activeBatsmen];

        // Remove the striker (out player)
        const updatedBatsmen = newBatsmenArray.filter((batsman, index) => index !== strikerIndex);

        // Find the next available batsman who is not already in activeBatsmen
        const nextAvailableBatsman = allBatsmen.find(
          (batsman) => !updatedBatsmen.includes(batsman)
        );

        // Add the next batsman to the end of the array
        updatedBatsmen.push(nextAvailableBatsman);

        // Update the activeBatsmen array
        setActiveBatsmen(updatedBatsmen);

        // If the striker was out, we make the non-striker the new striker
        if (strikerIndex === 0) {
          setStrikerIndex(1); // Non-striker becomes the new striker
        } else {
          setStrikerIndex(0); // Non-striker becomes the new striker
        }

        // Increment total wickets
        setTotalWickets((prevWickets) => prevWickets + 1);

        // Increment bowler's wickets
        setBowlers((prevBowlers) => {
          const newBowlers = [...prevBowlers];
           const currentBowler = newBowlers[0]; // Assuming one bowler

          

          // Increment the number of balls bowled
          newBowlers[0].wickets += 1;
          newBowlers[0].wickets += 1; // Assuming there's only one bowler
          return newBowlers;
        });

        // Add the wicket-related commentary
        setCommentary((prevCommentary) => [
          ...prevCommentary,
          `${data.option} - Batsman is out!`,
        ]);
      }

      // Set the latest message to show
      setLatestMessage(`This ball is: ${data.option}`);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [activeBatsmen, strikerIndex]);

  // Scroll to the bottom when commentary changes
  useEffect(() => {
    const scrollContainer = commentaryRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight; // Scroll to bottom
    }
  }, [commentary]); // Re-run this effect when the commentary array changes

  // Get striker with "*" mark
  const getStrikerName = (batsman, isStriker) => {
    return isStriker ? `${batsman.name} *` : batsman.name;
  };

  // Calculate total runs (sum of all runs from 1-6 events)
  const calculateTotalRuns = () => {
    let totalRuns = 0;
    commentary.forEach((msg) => {
      // Check for runs (1-6)
      if (["1", "2", "3", "4", "5", "6"].includes(msg.split(" ")[0])) {
        totalRuns += parseInt(msg.split(" ")[0]);
      }
    });
    return totalRuns;
  };

  // Calculate total wickets (sum of "Catch Out", "Wicket", "Run Out" events)
  const calculateTotalWickets = () => {
    let totalWickets = 0;
    commentary.forEach((msg) => {
      if (["Catch Out", "Wicket", "Run Out"].includes(msg)) {
        totalWickets += 1;
      }
    });
    return totalWickets;
  };

  return (
    <div className="scorecard-container p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
      {/* Display the latest WebSocket message */}
      <div className="mt-10">
        {latestMessage && (
          <div className="mt-4 text-center text-lg font-semibold text-blue-600">
            {latestMessage}
          </div>
        )}
      </div>

      {/* Score Summary */}
      <div className="score-summary mb-4 flex items-center justify-between bg-gray-100 p-4 rounded-lg">
        <div className="team flex flex-col items-center text-xl font-semibold">
          <span>{teamA.name}</span>
          <span>{calculateTotalRuns()} / {totalWickets}</span>
        </div>
        <div className="vs mx-4 text-xl font-bold">VS</div>
        <div className="team flex flex-col items-center text-xl font-semibold">
          <span>{teamB.name}</span>
          <span>{teamB.score} / {teamB.wickets}</span>
        </div>
      </div>

      {/* Batsmen Stats */}
      <div className="player-stats mb-4">
        <div className="section-header bg-gray-200 text-center py-2 mb-2 rounded-md font-medium">
          Batsman
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-center">
          <div className="font-semibold">Name</div>
          <div className="font-semibold">Runs (Balls)</div>
          <div className="font-semibold">4s</div>
        </div>

        {activeBatsmen.map((batsman, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-4 mb-2 text-sm text-center">
            <span>{getStrikerName(batsman, idx === strikerIndex)}</span>
            <span>{batsman.runs} ({batsman.balls})</span>
            <span>{batsman.fours}</span>
          </div>
        ))}
      </div>

      {/* Bowler Stats */}
      <div className="player-stats mb-4">
        <div className="section-header bg-gray-200 text-center py-2 mb-2 rounded-md font-medium">
          Bowler
        </div>
        {bowlers.map((bowler, idx) => (
          <div key={idx} className="flex justify-between mb-2 text-sm">
            <span>{bowler.name}</span>
            <span>{bowler.overs.toFixed(1)} O</span>
            <span>{calculateTotalRuns()} R</span>
            <span>{totalWickets} W</span>
          </div>
        ))}
      </div>

      {/* Commentary Section */}
      <div className="commentary mb-4">
        <div className="section-header bg-gray-200 text-center py-2 mb-2 rounded-md font-medium">
          Commentary
        </div>
        <ul
          ref={commentaryRef}
          className="list-none max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-md shadow-md"
        >
          {commentary.map((c, idx) => (
            <li key={idx} className="flex mb-2 text-sm">
              <span className="font-semibold mr-2">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ScoreCard;
