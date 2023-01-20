import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
app.use(express.json());

dotenv.config();

connectDB();

// Configurar CORS

const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      // El origen del request esta permitido
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

// Routing
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

// Socket.oio
import { Server } from "socket.io";

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Connect a socket.io");

  // Definir los eventos
  socket.on("open project", (project) => {
    socket.join(project);
  });

  // Socket IO
  socket.on("new task", (task) => {
    const project = task.project;
    socket.to(project).emit("Task added", task);
  });

  socket.on("delete task", (task) => {
    const project = task.project;
    socket.to(project).emit("Task deleted", task);
  });

  socket.on("update task", (task) => {
    const project = task.project._id;
    socket.to(project).emit("Task updated", task);
  });

  socket.on("change state", (task) => {
    const project = task.project._id;
    socket.to(project).emit("New state", task);
  });
});
