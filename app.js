import express from "express";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let users = [
  {
    id: uuidv4(),
    username: "JohnDoe",
    age: 30,
    hobbies: ["Reading", "Coding"],
  },
  {
    id: uuidv4(),
    username: "AliceSmith",
    age: 25,
    hobbies: ["Traveling", "Painting"],
  },
];

// Middleware to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Middleware to validate UUID
const validateUUID = (req, res, next) => {
  const userId = req.params.userId;
  if (
    !userId ||
    !userId.match(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    )
  ) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  next();
};

// Server health check
app.get("/", async (req, res) => {
  return res.status(200).json({
    message: "Server is running",
  });
});

// CRUD operations
app.get("/api/users", async (req, res) => {
  res.status(200).json(users);
});

app.get("/api/users/:userId", validateUUID, async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  const { username, age, hobbies } = req.body;

  if (!username || !age) {
    return res
      .status(400)
      .json({ error: "Username and age are required fields" });
  }

  try {
    const newUser = {
      id: uuidv4(),
      username,
      age,
      hobbies: hobbies || [],
    };

    users.push(newUser);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.put("/api/users/:userId", validateUUID, async (req, res) => {
  const userId = req.params.userId;

  try {
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const { username, age, hobbies } = req.body;

    if (!username || !age) {
      throw new Error("Username and age are required fields");
    }

    users[userIndex] = {
      id: userId,
      username,
      age,
      hobbies: hobbies || [],
    };

    res.status(200).json(users[userIndex]);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.delete("/api/users/:userId", validateUUID, async (req, res) => {
  const userId = req.params.userId;

  try {
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    users.splice(userIndex, 1);

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Handle 404 for non-existing endpoints
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

export default app;
