const titleScreen = document.getElementById("titleScreen");
const ruleScreen = document.getElementById("ruleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const retryButton = document.getElementById("retryButton");

const player = document.getElementById("player");
const gameArea = document.getElementById("gameScreen");

const timerText = document.getElementById("timer");
const lifeText = document.getElementById("life");

const bgm = new Audio("bgm.mp3");
bgm.loop = false;
bgm.volume = 0.5;

const GAME_TIME = 120;

let gameStarted = false;
let gameOver = false;

let startTime = 0;

let playerX = window.innerWidth / 2;
let targetX = playerX;

let life = 100;

let objects = [];

let driftPower = 1.7;
let driftDirection = 1;

const POLE_LANES = [
  window.innerWidth * 0.18,
  window.innerWidth * 0.82
];

function goToRule() {
  titleScreen.classList.add("hidden");
  ruleScreen.classList.remove("hidden");
}

function startGame() {

  if (gameStarted) return;

  gameStarted = true;

  ruleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  startTime = Date.now();

  bgm.currentTime = 0;
  bgm.play().catch(() => {});

ruleScreen.addEventListener("click", startGame, { once: true });