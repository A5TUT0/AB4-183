import { deflate } from "zlib";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import escapeHtml from "escape-html";
import { z } from "zod";
import jwt from "jsonwebtoken";
const secretKey = process.env.secretKey;

const db = new sqlite3.Database("ab04.db", sqlite3.OPEN_READWRITE);
const posts = [
  {
    id: 1,
    title: "Introduction to JavaScript",
    content:
      "JavaScript is a dynamic language primarily used for web development...",
  },
  {
    id: 2,
    title: "Functional Programming",
    content:
      "Functional programming is a paradigm where functions take center stage...",
  },
  {
    id: 3,
    title: "Asynchronous Programming in JS",
    content:
      "Asynchronous programming allows operations to run in parallel without blocking the main thread...",
  },
];
const initializeAPI = async (app) => {
  app.post("/api/login", login);
  app.get("/api/post", verifyToken, post);
};
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    if (decoded.role !== "viewer") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
const post = async (req, res) => {
  return res.json(posts);
};
const login = async (req, res) => {
  const { username, password } = req.body;
  const generateAccessToken = (user) => {
    return jwt.sign(
      { Benutzername: user.username, role: user.role },
      secretKey,
      {
        expiresIn: "1h",
      }
    );
  };
  db.get(
    "SELECT * FROM users WHERE Benutzername = ?",
    [username],
    (err, user) => {
      if (err || !user) {
        return res
          .status(400)
          .json({ error: "Username or password are invalid" });
      }
      console.log(password);
      console.log(user);
      console.log(user.Passwort);
      console.log(password);
      bcrypt.compare(password, user.Passwort, (err, isMatch) => {
        if (err || !isMatch) {
          return res
            .status(400)
            .json({ error: "Username or password are invalid" });
        }

        user.role = user.role || "viewer";
        console.log("User with role before generating token:", user);
        const accessToken = generateAccessToken(user);
        res.status(200).json({
          message: "Login Succesful",
          token: accessToken,
          user: {
            Benutzername: user.username,
            Passwort: user.Passwort,
            role: user.role,
          },
        });
        console.log("NICE");
      });
    }
  );
  /*const schema = z.object({
    username: z.string().email({ message: "Must be a valid email" }),
    password: z
      .string()
      .min(10, { message: "Must be 10 or more characters long" }),
  });

  const input = schema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({
      error: input.error.errors.map((err) => err.message).join(", "),
    });
  } 

  // const salt = 10;
  // const hashedPassword = await bcrypt.hash(safePassword, salt);

  const answer = `
    <h1>Answer</h1>
    <p>Username: ${username}</p>
    <p>Password: ${password}</p>
  `;

  res.send(answer);
  */
};

export default initializeAPI;
