/* eslint-disable consistent-return */
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// Mock database
const adminUsers = [
  {
    username: "admin",
    passwordHash:
      "$2b$10$bWg5XXrqAlbi5JMd5Ylpy.oRyr6JmYocIvxQ4bxY.KIOLD4RpQy0S",
    role: "admin",
  },
];

app.use(
  cors({
    credentials: true,
    origin: [
      "https://goldfish-app-cr82c.ondigitalocean.app",
      "http://localhost:3030",
      "http://localhost:3031",
    ],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123"; //

const generateToken = (user) =>
  jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  });

// Admin login route
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  const admin = adminUsers.find((user) => user.username === username);
  if (!admin) {
    return res
      .status(401)
      .json({ status: false, message: "Invalid credentials" });
  }
  const passwordValid = await bcrypt.compare(password, admin.passwordHash);
  console.log(username, password, admin?.passwordHash);
  if (!passwordValid) {
    return res
      .status(401)
      .json({ status: false, message: "Invalid credentials" });
  }
  const token = generateToken(admin);
  res.status(200).json({ status: true, token, message: "login successfull" });
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(403);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/admin/dashboard", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.sendStatus(403);
  }

  res.json({
    message: "Welcome to the Admin Dashboard",
    user: req.user,
  });
});

app.get("/third-party-api", verifyToken, (req, res) => {
  res.json({
    message: "Third-party API integration will go here!",
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
