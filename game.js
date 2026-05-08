const titleScreen = document.getElementById("titleScreen");
const ruleScreen = document.getElementById("ruleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const retryButton = document.getElementById("retryButton");
const player = document.getElementById("player");
const timerText = document.getElementById("timer");
const lifeText = document.getElementById("life");

const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");

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

let driftPower = 1.55;
let driftDirection = 1;

let timers = [];

function addTimer(id) {
  timers.push(id);
}

function clearAllTimers() {
  timers.forEach(clearInterval);
  timers = [];
}

function goToRule() {
  titleScreen.classList.add("hidden");
  ruleScreen.classList.remove("hidden");
}

function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  gameOver = false;

  ruleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  startTime = Date.now();

  bgm.currentTime = 0;
  bgm.play().catch(() => {});

  requestAnimationFrame(gameLoop);

  addTimer(setInterval(spawnPole, 1700));
  addTimer(setInterval(spawnCat, 3200));
  addTimer(setInterval(spawnCrow, 2600));
  addTimer(setInterval(spawnPocari, 5600));
}

function gameLoop() {
  if (gameOver) return;

  updateTimer();
  updatePlayer();
  updateObjects();
  updateLife();

  requestAnimationFrame(gameLoop);
}

function updatePlayer() {
  playerX += driftPower * driftDirection;

  if (Math.random() < 0.022) {
    driftDirection *= -1;
  }

  playerX += (targetX - playerX) * 0.09;

  playerX = Math.max(44, Math.min(window.innerWidth - 44, playerX));

  player.style.left = playerX + "px";
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remain = Math.max(0, GAME_TIME - elapsed);

  timerText.textContent = remain;

  if (remain <= 0) {
    endGame(true);
  }
}

function updateLife() {
  life = Math.max(0, Math.min(100, life));

  const bars = Math.ceil(life / 10);

  lifeText.textContent =
    "LIFE " + "█".repeat(bars) + "░".repeat(10 - bars);

  if (life <= 0) {
    endGame(false);
  }
}

function updateObjects() {
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];

    obj.y += obj.speedY;
    obj.x += obj.speedX;

    if (obj.kind === "crow") {
      obj.x += Math.sin(Date.now() / 180 + obj.waveOffset) * 1.2;
    }

    obj.el.style.left = obj.x + "px";
    obj.el.style.top = obj.y + "px";

    const playerY = window.innerHeight - 105;
    const dx = playerX - obj.x;
    const dy = playerY - obj.y;

    if (Math.abs(dx) < obj.hitX && Math.abs(dy) < obj.hitY) {
      if (obj.type === "heal") {
        life += obj.heal;
        showFloatText("+LIFE", obj.x, obj.y, false);
      } else {
        life -= obj.damage;
        showFloatText("-" + obj.damage, obj.x, obj.y, true);
      }

      removeObject(i);
      continue;
    }

    if (
      obj.y > window.innerHeight + 180 ||
      obj.x < -180 ||
      obj.x > window.innerWidth + 180
    ) {
      removeObject(i);
    }
  }
}

function removeObject(index) {
  objects[index].el.remove();
  objects.splice(index, 1);
}

function createObject(src, x, y, width) {
  const img = document.createElement("img");

  img.src = src;
  img.className = "object";
  img.style.width = width + "px";
  img.style.left = x + "px";
  img.style.top = y + "px";

  gameScreen.appendChild(img);

  return img;
}

function spawnPole() {
  if (gameOver) return;

  const lanes = [
    window.innerWidth * 0.16,
    window.innerWidth * 0.84
  ];

  const x = lanes[Math.floor(Math.random() * lanes.length)];

  const el = createObject("pole.png", x, -230, 92);

  objects.push({
    el,
    kind: "pole",
    type: "damage",
    x,
    y: -230,
    speedX: 0,
    speedY: 6.2,
    damage: 18,
    hitX: 38,
    hitY: 80
  });
}

function spawnCat() {
  if (gameOver) return;

  const fromRight = Math.random() < 0.5;

  const x = fromRight ? window.innerWidth + 70 : -70;
  const y = Math.random() * 260 + 130;

  const speedX = fromRight ? -4.3 : 4.3;

  const el = createObject("cat.png", x, y, 66);

  if (!fromRight) {
    el.style.transform = "translateX(-50%) scaleX(-1)";
  }

  objects.push({
    el,
    kind: "cat",
    type: "damage",
    x,
    y,
    speedX,
    speedY: 1.2,
    damage: 9,
    hitX: 34,
    hitY: 30
  });
}

function spawnCrow() {
  if (gameOver) return;

  const x = Math.random() * (window.innerWidth - 100) + 50;
  const diagonal = Math.random() < 0.5 ? -1.8 : 1.8;

  const el = createObject("crow.png", x, -90, 70);

  objects.push({
    el,
    kind: "crow",
    type: "damage",
    x,
    y: -90,
    speedX: diagonal,
    speedY: 4.3,
    damage: 8,
    hitX: 34,
    hitY: 34,
    waveOffset: Math.random() * 100
  });
}

function spawnPocari() {
  if (gameOver) return;

  const x = Math.random() * (window.innerWidth - 120) + 60;

  const el = createObject("pocari.png", x, -90, 60);

  objects.push({
    el,
    kind: "pocari",
    type: "heal",
    x,
    y: -90,
    speedX: 0,
    speedY: 3.9,
    heal: 22,
    hitX: 34,
    hitY: 40
  });
}

function showFloatText(text, x, y, damage) {
  const div = document.createElement("div");

  div.className = "float-text";
  if (damage) div.classList.add("damage-text");

  div.textContent = text;
  div.style.left = x + "px";
  div.style.top = y + "px";

  gameScreen.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 900);
}

function endGame(clear) {
  if (gameOver) return;

  gameOver = true;
  clearAllTimers();

  bgm.pause();

  objects.forEach(obj => obj.el.remove());
  objects = [];

  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  if (clear) {
    resultTitle.textContent = "無事生還！";
    resultText.innerHTML = "終電に間に合った…";
  } else {
    resultTitle.textContent = "路上エンド…";
    resultText.innerHTML = "のみすぎ注意";
  }
}

window.addEventListener("mousemove", e => {
  targetX = e.clientX;
});

window.addEventListener("touchmove", e => {
  if (e.touches.length > 0) {
    targetX = e.touches[0].clientX;
  }
}, { passive: true });

titleScreen.addEventListener("click", goToRule, { once: true });
ruleScreen.addEventListener("click", startGame, { once: true });

retryButton.addEventListener("click", () => {
  location.reload();
});