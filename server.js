const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 10000;

// Middleware to parse JSON (for account creation later if needed)
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Route for home page (serve index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Example API route (for testing)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
