const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const cors = require("cors");
const WebSocket = require("ws");
const app = express();
const port = 3000;

// Set up WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Middleware for Express
mongoose
  .connect("mongodb://localhost:27017/cricket", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3002"],
    credentials: true,
  })
);

const broadcastMessage = (message) => {
    console.log("Broadcasting message----> ", JSON.stringify(message));
  
    // Send the message to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };
  

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send("Please provide name, email, and password.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send("User already exists with that email.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();

    const token = jwt.sign(
      { email: newUser.email, name: newUser.name },
      "SUPER_SECRET_KEY"
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please provide email and password.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send("Invalid email or password.");
  }

  const token = jwt.sign(
    { email: user.email, name: user.name },
    "SUPER_SECRET_KEY"
  );

  res.status(200).json({ token });
});

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send("Access denied. No token provided.");
  }

  jwt.verify(token, "SUPER_SECRET_KEY", (err, decoded) => {
    if (err) {
      return res.status(403).send("Invalid token.");
    }
    req.user = decoded;
    next();
  });
};

app.get("/protected", verifyToken, (req, res) => {
  res
    .status(200)
    .send(`Hello ${req.user.name}, you have access to this protected route!`);
});

// Handle WebSocket connections separately
app.server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

app.post("/done", (req, res) => {
  const { option } = req.body;

  if (!option) {
    return res.status(400).send("Please provide an option.");
  }

  broadcastMessage({
    type: "selected_option",
    option,
  });

  res.status(200).send("Option sent to all clients.");
});

