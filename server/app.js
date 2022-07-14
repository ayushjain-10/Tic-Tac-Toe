const http = require("http"),
    express = require("express"),
    app = express(),
    socketIo = require("socket.io");
const fs = require("fs");

const server = http.Server(app).listen(3000);
const io = socketIo(server);
const clients = {};

app.use(express.static(__dirname + "/../static/"));
app.use(express.static(__dirname + "/../node_modules/"));

app.get("/", (req, res) => {
    const stream = fs.createReadStream(__dirname + "/../static/index.html");
    stream.pipe(res);
});

const addClient = socket => {
    console.log("New client connected", socket.id);
    clients[socket.id] = socket;
};
const removeClient = socket => {
    console.log("Client disconnected", socket.id);
    delete clients[socket.id];
};

io.sockets.on("connection", socket => {
    let id = socket.id;

    addClient(socket);

    socket.on("mousemove", data => {
        data.id = id;
        socket.broadcast.emit("moving", data);
    });

    socket.on("disconnect", () => {
        removeClient(socket);
        socket.broadcast.emit("clientdisconnect", id);
    });
});

var players = {},
    unmatched;

function joinGame(socket) {

    players[socket.id] = {
        opponent: unmatched,

        symbol: "X",

        socket: socket
    };

    if (unmatched) {
        players[socket.id].symbol = "O";
        players[unmatched].opponent = socket.id;
        unmatched = null;
    } else {
        unmatched = socket.id;
    }
}

function getOpponent(socket) {
    if (!players[socket.id].opponent) {
        return;
    }

    return players[players[socket.id].opponent].socket;
}

io.on("connection", function (socket) {
    joinGame(socket);

    if (getOpponent(socket)) {
        socket.emit("game.begin", {
            symbol: players[socket.id].symbol
        });

        getOpponent(socket).emit("game.begin", {
            symbol: players[getOpponent(socket).id].symbol
        });
    }

    socket.on("make.move", function (data) {
        if (!getOpponent(socket)) {
            return;
        }

        socket.emit("move.made", data);
        getOpponent(socket).emit("move.made", data);
    });

    socket.on("disconnect", function () {
        if (getOpponent(socket)) {
            getOpponent(socket).emit("opponent.left");
        }
    });
});
