const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

let snake = [{ x: 150, y: 150 }];
let direction = "RIGHT";
let food = { x: 100, y: 100 };
let gameLoop;

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  snake.forEach(s => ctx.fillRect(s.x, s.y, 10, 10));

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, 10, 10);
}

function update() {
  let head = { ...snake[0] };
  if (direction === "UP") head.y -= 10;
  if (direction === "DOWN") head.y += 10;
  if (direction === "LEFT") head.x -= 10;
  if (direction === "RIGHT") head.x += 10;

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    food = {
      x: Math.floor(Math.random() * 30) * 10,
      y: Math.floor(Math.random() * 30) * 10
    };
  } else {
    snake.pop();
  }

  draw();
}

function startGame() {
  clearInterval(gameLoop);
  snake = [{ x: 150, y: 150 }];
  direction = "RIGHT";
  food = { x: 100, y: 100 };
  gameLoop = setInterval(update, 100);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// --- Auth functions ---
async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  alert(data.success ? "Registered!" : data.error);
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("menu").style.display = "block";
  } else {
    alert(data.error);
  }
}

// --- Game modes ---
function startSingle() {
  startGame();
}

function findMatch() {
  socket.emit("findMatch");
  socket.on("matchFound", (opponentId) => {
    alert("Match found! Opponent: " + opponentId);
    startGame();
  });
}
