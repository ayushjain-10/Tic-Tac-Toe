const http = require("http"),
    express = require("express"),
    app = express(),
    socketIo = require("socket.io");
const fs = require("fs");

const server = http.Server(app).listen(3000);
const io = socketIo(server);
const user = {};

var rooms = 0;

app.use(express.static(__dirname + "/../static/"));
app.use(express.static(__dirname + "/../node_modules/"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/../static/index.html");
});

const adduser = socket => {
    console.log("New user connected", socket.id);
    user[socket.id] = socket;
};
const removeuser = socket => {
    console.log("User disconnected", socket.id);
    delete user[socket.id];
};

io.sockets.on("connection", socket => {
    let id = socket.id;

    adduser(socket);

    socket.on("mousemove", data => {
        data.id = id;
        socket.broadcast.emit("moving", data);
    });

    socket.on("disconnect", () => {
        removeuser(socket);
        socket.broadcast.emit("userdisconnect", id);
    });
});

var player = {},
    unmatched;

function joinGame(socket) {

    player[socket.id] = {
        opponent: unmatched,

        symbol: "X",

        socket: socket
    };

    if (unmatched) {
        player[socket.id].symbol = "O";
        player[unmatched].opponent = socket.id;
        unmatched = null;
    } else {
        unmatched = socket.id;
    }
}

function Opponent(socket) {
    if (!player[socket.id].opponent) {
        return;
    }

    return player[player[socket.id].opponent].socket;
}

io.on("connection", function (socket) {
    joinGame(socket);

    if (Opponent(socket)) {
        socket.emit("game.begin", {
            symbol: player[socket.id].symbol
        });

        Opponent(socket).emit("game.begin", {
            symbol: player[Opponent(socket).id].symbol
        });
    }

    socket.on("make.move", function (data) {
        if (!Opponent(socket)) {
            return;
        }

        socket.emit("move.made", data);
        Opponent(socket).emit("move.made", data);
    });

    socket.on("disconnect", function () {
        if (Opponent(socket)) {
            Opponent(socket).emit("opponent.left");
        }
    });
});
