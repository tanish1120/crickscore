import React, { useState, useEffect } from "react";

const Dashboard = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [message, setMessage] = useState("");
  const [overBall, setOverBall] = useState("0.0"); // Initialize with 0.0 for first over
  const [currentRuns, setCurrentRuns] = useState(0); // Start with some runs
  const [ws, setWs] = useState(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const options = [
    "0", "1", "2", "3", "4", "5", "6",
    "No Ball", "Wide", "Catch Out", "Wicket", "Run Out"
  ];

  useEffect(() => {
    // Connect to WebSocket server
    const socket = new WebSocket("ws://localhost:3000");
    socket.onopen = () => console.log("Connected to WebSocket server");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "selected_option") {
        setBroadcastMessage(`Option selected: ${data.option}`);
      }
    };
    setWs(socket);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleSelection = (option) => {
    setSelectedOption(option);
    setMessage("");
  };

  const handleDone = async () => {
    if (!selectedOption) {
      setMessage("Please select an option before pressing 'Done'.");
    } else {
      setMessage(`You selected "${selectedOption}".`);
      setSelectedOption("");

      // Update current runs and over/ball based on selected option
      let runsScored = 0;
      let newOverBall = overBall.split('.'); // Split over/ball (eg. "1.4" -> [1, 4])
      let newRuns = currentRuns;

      // Handle the selected option
      if (["No Ball", "Wide"].includes(selectedOption)) {
        // No Ball and Wide don't count towards ball count but they do add runs
        if (selectedOption === "No Ball" || selectedOption === "Wide") {
          runsScored = 1; // No ball and wide add 1 run by default
          newOverBall[1] = (parseInt(newOverBall[1]) + 1) % 6; // Increment ball
          if (newOverBall[1] === 0) {
            newOverBall[0] = parseInt(newOverBall[0]) + 1; // Increment over when ball hits 6
          }
        }
      } else if (["Catch Out", "Wicket", "Run Out"].includes(selectedOption)) {
        // Wicket events don't add runs, but they do affect the game
        runsScored = 0;
      } else {
        // Normal runs between 0-6
        runsScored = parseInt(selectedOption);
        newOverBall[1] = (parseInt(newOverBall[1]) + 1) % 6; // Increment ball
        if (newOverBall[1] === 0) {
          newOverBall[0] = parseInt(newOverBall[0]) + 1; // Increment over when ball hits 6
        }
      }

      // Update the state with the new runs and over/ball
      setCurrentRuns(newRuns + runsScored);
      setOverBall(newOverBall.join('.'));

      // Send selected option to backend via POST request
      try {
        const response = await fetch("http://localhost:3000/done", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ option: selectedOption }),
        });
        if (response.ok) {
          console.log("Option broadcasted to all clients.");
        } else {
          console.log("Error broadcasting option.");
        }
      } catch (error) {
        console.error("Error sending option:", error);
      }
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row-reverse justify-between items-center h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-4">
    <button
      onClick={() => {
        // Perform logout logic here
        console.log("User logged out");
        localStorage.removeItem("token"); // Remove token from local storage
        window.location.href = "/login"; // Redirect to login page
      }}
      className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 shadow-md transition-all duration-200 mt-4"
    >
      Logout
    </button>
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 px-4 py-2 rounded-lg">
          Select What Happens in next ball:
        </h1>
        <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-md">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelection(option)}
              className={`px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                selectedOption === option
                  ? "bg-blue-600 scale-105 shadow-lg"
                  : "bg-blue-400 hover:bg-blue-500"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={handleDone}
          className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 shadow-lg transition-all duration-200"
        >
          Done
        </button>
        {message && <p className="mt-4 text-red-600 font-medium">{message}</p>}
      </div>
      <div className="w-1/4 max-w-[13rem] p-4 bg-white shadow-lg rounded-lg h-auto my-auto">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">Match Info</h2>
        <p className="text-gray-700 font-medium">
          <span className="font-bold text-black">Over/Ball:</span> {overBall}
        </p>
        <p className="text-gray-700 font-medium">
          <span className="font-bold text-black">Current Runs:</span>{" "}
          {currentRuns}
        </p>
        {broadcastMessage && (
          <p className="mt-4 text-green-600 font-medium">{broadcastMessage}</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
