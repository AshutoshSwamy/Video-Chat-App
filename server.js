const express = require("express");
const app = express();
const server = require("http").Server(app);
const { generate } = require("randomise-id");

app.set("view engine", "ejs");
app.use(express.static("public"));

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${generate(10)}`);
});

app.get("/:room", (req, res) => {
  res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    io.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030, () => {
  console.log("App is active!");
});
