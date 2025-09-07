const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const bcrypt = require("bcrypt");
const fs = require("fs");

const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Users storage (simple JSON file)
const USERS_FILE = "./users.json";
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, "{}");
}
let users = JSON.parse(fs.readFileSync(USERS_FILE));

// Auth endpoints
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (users[username]) return res.status(400).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  users[username] = hashed;
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));
  res.json({ success: true });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(400).json({ error: "Invalid user" });

  const match = await bcrypt.compare(password, user);
  if (!match) return res.status(400).json({ error: "Invalid password" });

  res.json({ success: true });
});

// Multiplayer (simple matchmaking)
let waitingPlayer = null;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("findMatch", () => {
    if (waitingPlayer) {
      const opponent = waitingPlayer;
      waitingPlayer = null;
      socket.emit("matchFound", opponent.id);
      opponent.emit("matchFound", socket.id);
    } else {
      waitingPlayer = socket;
    }
  });

  socket.on("move", (data) => {
    socket.broadcast.emit("opponentMove", data);
  });

  socket.on("disconnect", () => {
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
    console.log("User disconnected:", socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
