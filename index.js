const express = require("express");
require("dotenv").config();
const http = require("http"); 
const app = express();
const socketIO = require("./socket");

const connectDB = require("./config/db");
connectDB();

// Middleware
app.use(express.json());

// API Routes
const apiRoutes = require("./routes/index");
app.use("/api", apiRoutes);


const server = http.createServer(app);

const io = socketIO(server); 

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
