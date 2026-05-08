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

/* 120秒は長く感じたため、まずは60秒版 */
const GAME_TIME = 60;

let gameStarted = false;
let gameOver = false;
let startTime = 0;

let playerX = window.innerWidth / 2;
let targetX = playerX;

let life = 100;
let objects = [];

/* ふらつき強め */
let driftPower = 2.65;
let driftDirection = 1;

let timers = [];

function addTimer(id) {
  timers.push(id);
}

function clearAllTimers() {
  timers.forEach(clearInterval);
  timers = [];
}

function getRoadMin() {
  return window.innerWidth * 0.33;
}

function getRoadMax() {
  return window.innerWidth * 0.67;
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

  playerX = window.innerWidth / 2;
  targetX = playerX;
  life = 100;
  objects = [];

  bgm.currentTime = 0;
  bgm.play().catch(() => {});

  requestAnimationFrame(gameLoop);

  addTimer(setInterval(spawnPole, 1250));
  addTimer(setInterval(spawnCat, 2800));
  addTimer(setInterval(spawnCrow, 2300));
  addTimer(setInterval(spawnPocari, 5000));
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

  if (Math.random() < 0.032) {
    driftDirection *= -1;
  }

  /* 操作追従を弱めて、酔っぱらい感を強化 */
  playerX += (targetX - playerX) * 0.045;

  playerX = Math.max(getRoadMin(), Math.min(getRoadMax(), playerX));

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
      obj.x += Math.sin(Date.now() / 170 + obj.waveOffset) * 1.35;
    }

    obj.el.style.left = obj.x + "px";
    obj.el.style.top = obj.y + "px";

    const playerY = window.innerHeight - 100;
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

  /* 道幅中央1/3の中に出す */
  const lanes = [
    window.innerWidth * 0.38,
    window.innerWidth * 0.50,
    window.innerWidth * 0.62
  ];

  const x = lanes[Math.floor(Math.random() * lanes.length)];

  const el = createObject("pole.png", x, -230, 98);

  objects.push({
    el,
    kind: "pole",
    type: "damage",
    x,
    y: -230,
    speedX: 0,
    speedY: 6.8,
    damage: 20,
    hitX: 44,
    hitY: 88
  });
}

function spawnCat() {
  if (gameOver) return;

  const fromRight = Math.random() < 0.5;

  const x = fromRight ? window.innerWidth * 0.72 : window.innerWidth * 0.28;
  const y = Math.random() * 240 + 150;

  const speedX = fromRight ? -4.8 : 4.8;

  const el = createObject("cat.png", x, y, 70);

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
    speedY: 1.3,
    damage: 10,
    hitX: 36,
    hitY: 32
  });
}

function spawnCrow() {
  if (gameOver) return;

  const x = Math.random() * (getRoadMax() - getRoadMin()) + getRoadMin();
  const diagonal = Math.random() < 0.5 ? -2.1 : 2.1;

  const el = createObject("crow.png", x, -90, 74);

  objects.push({
    el,
    kind: "crow",
    type: "damage",
    x,
    y: -90,
    speedX: diagonal,
    speedY: 4.8,
    damage: 9,
    hitX: 36,
    hitY: 36,
    waveOffset: Math.random() * 100
  });
}

function spawnPocari() {
  if (gameOver) return;

  const x = Math.random() * (getRoadMax() - getRoadMin()) + getRoadMin();

  const el = createObject("pocari.png", x, -90, 62);

  objects.push({
    el,
    kind: "pocari",
    type: "heal",
    x,
    y: -90,
    speedX: 0,
    speedY: 4.2,
    heal: 22,
    hitX: 36,
    hitY: 42
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
    resultText.innerHTML = "駅まで帰れた…";
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