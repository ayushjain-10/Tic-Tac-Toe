# Tic-Tac-Toe
Tic tac toe game using Socket.io & Express.js

![alt text](https://github.com/ayushjain-10/Tic-Tac-Toe/blob/room/static/pic.png?raw=true)

## Websockets
Browser-based multiplayer games require split-second communication between players. Tic-Tac-Toe is no exception. Player1 needs to see Player2s move in less than a second.We can use WebSocket API to achieve this communication speed.

## How To Play
To run this game: 

1. Clone this repository

2. Run `npm install`

3. Run `nodemon`

4. Open up two web pages on http://localhost:8080/ and start playing

## Dockerfile

1. Build the Image - 
`docker build -t node-image .`

2. Run the Container -
`docker run -p 8080:8080 --d --rm --name flask-container flask-image`

3. Go to localhost:8080
