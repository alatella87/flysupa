import express from "express";

const app = express();

// Use PORT from environment variable or default to 8080
const PORT = process.env.PORT || 8080;

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello, Cloud Run with ES Modules!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
