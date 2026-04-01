const track = document.getElementById("track");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const pickupCountEl = document.getElementById("pickup-count");
const comboCountEl = document.getElementById("combo-count");
const boostFillEl = document.getElementById("boost-fill");
const boostStatusEl = document.getElementById("boost-status");
const boostTimerEl = document.getElementById("boost-timer");
const messageEl = document.getElementById("game-message");
const gameOverTitleEl = document.getElementById("game-over-title");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");
const jumpButton = document.getElementById("jump-button");
const boostButton = document.getElementById("boost-button");
const duckButton = document.getElementById("duck-button");

const bestStorageKey = "cloud-runner-best";
const gravity = 0.88;
const jumpVelocity = -15.2;
const initialSpeed = 4.3;
const maxSpeed = 9.8;
const boostSpeedBonus = 1.9;
const groundY = 68;
const comboWindowMs = 2600;
const boostDurationMs = 4200;
const gliderDurationMs = 10000;
const expFruitTarget = 3;
const humanChargePerSecond = 18;
const scoreTierInterval = 1000;
const speedTierBonus = 0.7;

const state = {
  running: false,
  started: false,
  paused: false,
  gameOver: false,
  speed: initialSpeed,
  distance: 0,
  score: 0,
  pickups: 0,
  combo: 1,
  boostMeter: 0,
  boostTimeLeft: 0,
  gliderTimeLeft: 0,
  hasArmor: false,
  armorCollected: false,
  expFruit: 0,
  humanSkin: false,
  bestScore: Number(localStorage.getItem(bestStorageKey) || 0),
  lastTime: 0,
  obstacleSpawnTimer: 0,
  pickupSpawnTimer: 0,
  nextObstacleIn: 102,
  nextPickupIn: 64,
  comboTimer: 0,
  obstacles: [],
  pickupsOnField: [],
  player: {
    y: 0,
    velocityY: 0,
    width: 62,
    height: 74,
    ducking: false,
    extraJumpsLeft: 0,
  },
};

bestScoreEl.textContent = formatScore(state.bestScore);
setMessage("按空格开始，收集星果充能，蓄满后按向前键释放冲刺");
renderHud();
resetPlayerVisual();

function formatScore(value) {
  return Math.floor(value).toString().padStart(5, "0");
}

function setMessage(text) {
  messageEl.textContent = text;
}

function playerLeft() {
  return parseFloat(getComputedStyle(track).getPropertyValue("--player-left"));
}

function renderHud() {
  const gliderStatusEl = document.getElementById("glider-status");
  const armorStatusEl = document.getElementById("armor-status");
  const expStatusEl = document.getElementById("exp-status");

  scoreEl.textContent = formatScore(state.score);
  bestScoreEl.textContent = formatScore(state.bestScore);
  pickupCountEl.textContent = String(state.pickups).padStart(2, "0");
  comboCountEl.textContent = `x${state.combo}`;
  boostFillEl.style.width = `${state.boostMeter}%`;
  boostStatusEl.textContent = state.boostTimeLeft > 0 ? "冲刺中" : state.boostMeter >= 100 ? "待释放" : "未激活";
  boostTimerEl.textContent = `${Math.max(0, state.boostTimeLeft / 1000).toFixed(1)}s`;
  boostFillEl.classList.toggle("boosting", state.boostTimeLeft > 0);
  document.body.classList.toggle("boost-active", state.boostTimeLeft > 0);
  document.body.classList.toggle("glider-active", state.gliderTimeLeft > 0);
  document.body.classList.toggle("armor-active", state.hasArmor);
  document.body.classList.toggle("skin-human", state.humanSkin);
  document.body.classList.toggle("night-mode", Math.floor(state.score / 1000) % 2 === 1);
  gameOverTitleEl.textContent = state.humanSkin ? "小人摔倒了" : "袋鼠摔倒了";
  gliderStatusEl.textContent = state.gliderTimeLeft > 0 ? `滑翔机: ${(state.gliderTimeLeft / 1000).toFixed(1)}s` : "滑翔机: 未激活";
  armorStatusEl.textContent = state.hasArmor ? "铠甲: 已装备" : state.armorCollected ? "铠甲: 已消耗" : "铠甲: 无";
  expStatusEl.textContent = state.humanSkin ? "经验果: 已升级" : `经验果: ${state.expFruit}/${expFruitTarget}`;
}

function resetPlayerVisual() {
  player.style.bottom = `${groundY + state.player.y}px`;
  player.classList.remove("jumping", "ducking", "boosting", "double-jumping");
  player.classList.toggle("running", state.running && !state.paused && !state.gameOver);
}

function createEntity(type) {
  const el = document.createElement("div");

  if (type === "obstacle") {
    const variant = Math.random() > 0.45 ? "brush" : "spike";
    const widthRange = variant === "brush" ? [28, 48] : [40, 68];
    const heightRange = variant === "brush" ? [46, 82] : [22, 38];
    const width = Math.round(widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]));
    const height = Math.round(heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]));
    const bottom = 68;

    el.className = `obstacle ${variant}`;
    el.dataset.kind = "obstacle";
    el.dataset.variant = variant;
    el.dataset.width = width;
    el.dataset.height = height;
    el.dataset.bottom = bottom;
    el.dataset.x = track.clientWidth + 28;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.left = `${track.clientWidth + 28}px`;
    el.style.bottom = `${bottom}px`;
    track.appendChild(el);
    state.obstacles.push(el);
    return;
  }

  const pickupHeight = [88, 126, 170][Math.floor(Math.random() * 3)];
  const pickupPool = [
    { variant: "starfruit", weight: 30, size: 24 },
    { variant: "gem", weight: 18, size: 22 },
    { variant: "berry", weight: 18, size: 26 },
    { variant: "glider", weight: 8, size: 30 },
    { variant: "expfruit", weight: 10, size: 24 },
  ];

  if (!state.armorCollected && !state.hasArmor) {
    pickupPool.push({ variant: "armor", weight: 6, size: 28 });
  }

  const totalWeight = pickupPool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  let selected = pickupPool[0];

  for (const entry of pickupPool) {
    roll -= entry.weight;

    if (roll <= 0) {
      selected = entry;
      break;
    }
  }

  const pickupVariant = selected.variant;
  const pickupSize = selected.size;

  el.className = `pickup ${pickupVariant}`;
  el.dataset.kind = "pickup";
  el.dataset.variant = pickupVariant;
  el.dataset.width = pickupSize;
  el.dataset.height = pickupSize;
  el.dataset.bottom = pickupHeight;
  el.dataset.x = track.clientWidth + 28;
  el.style.width = `${pickupSize}px`;
  el.style.height = `${pickupSize}px`;
  el.style.left = `${track.clientWidth + 28}px`;
  el.style.bottom = `${pickupHeight}px`;
  track.appendChild(el);
  state.pickupsOnField.push(el);
}

function clearEntities() {
  state.obstacles.forEach((item) => item.remove());
  state.pickupsOnField.forEach((item) => item.remove());
  state.obstacles = [];
  state.pickupsOnField = [];
}

function startGame() {
  if (state.running && !state.paused) {
    return;
  }

  if (state.gameOver) {
    restartGame();
  }

  state.started = true;
  state.running = true;
  state.paused = false;
  state.lastTime = performance.now();
  player.classList.add("running");
  setMessage("进入草地，优先收集星果来填满冲刺槽");
  requestAnimationFrame(gameLoop);
}

function pauseGame() {
  if (!state.started || state.gameOver) {
    return;
  }

  state.paused = !state.paused;
  state.running = !state.paused;
  player.classList.toggle("running", !state.paused);
  setMessage(state.paused ? "已暂停，按 P 或按钮继续" : "继续前进，连击不要断");

  if (!state.paused) {
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
}

function restartGame() {
  clearEntities();
  state.running = false;
  state.started = false;
  state.paused = false;
  state.gameOver = false;
  state.speed = initialSpeed;
  state.distance = 0;
  state.score = 0;
  state.pickups = 0;
  state.combo = 1;
  state.boostMeter = 0;
  state.boostTimeLeft = 0;
  state.gliderTimeLeft = 0;
  state.hasArmor = false;
  state.armorCollected = false;
  state.expFruit = 0;
  state.humanSkin = false;
  state.lastTime = 0;
  state.obstacleSpawnTimer = 0;
  state.pickupSpawnTimer = 0;
  state.nextObstacleIn = 102;
  state.nextPickupIn = 64;
  state.comboTimer = 0;
  state.player = {
    y: 0,
    velocityY: 0,
    width: 62,
    height: 74,
    ducking: false,
    extraJumpsLeft: 0,
  };
  document.body.classList.remove("game-over");
  setMessage("重置完成，继续出发");
  renderHud();
  resetPlayerVisual();
}

function jump() {
  if (!state.started) {
    startGame();
  }

  if (!state.running || state.paused || state.gameOver) {
    return;
  }

  if (state.player.y === 0) {
    state.player.velocityY = jumpVelocity;
    state.player.extraJumpsLeft = state.gliderTimeLeft > 0 ? 1 : 0;
    player.classList.add("jumping");
    player.classList.remove("double-jumping");
    return;
  }

  if (state.gliderTimeLeft > 0 && state.player.extraJumpsLeft > 0) {
    state.player.velocityY = jumpVelocity * 0.92;
    state.player.extraJumpsLeft -= 1;
    player.classList.add("jumping", "double-jumping");
    setMessage("滑翔机生效，完成一次空中二连跳");
  }
}

function setDuck(active) {
  if (state.gameOver) {
    return;
  }

  if (!state.started && active) {
    startGame();
  }

  state.player.ducking = active;
  state.player.height = active ? 50 : 74;
  state.player.width = active ? 76 : 62;
  player.classList.toggle("ducking", active);
}

function activateBoost() {
  if (state.boostMeter < 100 || state.boostTimeLeft > 0) {
    return;
  }

  state.boostMeter = 100;
  state.boostTimeLeft = boostDurationMs;
  player.classList.add("boosting");
  setMessage("手动释放冲刺，当前可以直接撞碎障碍");
  renderHud();
}

function triggerBoost() {
  if (!state.started) {
    startGame();
    return;
  }

  if (state.boostMeter >= 100 && state.boostTimeLeft <= 0 && !state.gameOver) {
    activateBoost();
  }
}

function collectStandardPickup(item) {
  item.remove();
  state.pickupsOnField = state.pickupsOnField.filter((entry) => entry !== item);
  state.pickups += 1;
  state.combo = Math.min(9, state.combo + 1);
  state.comboTimer = comboWindowMs;
  state.boostMeter = Math.min(100, state.boostMeter + 25);
  state.score += 18 * state.combo;

  if (state.boostMeter >= 100 && state.boostTimeLeft <= 0) {
    setMessage("冲刺已蓄满，按向前键释放");
  } else {
    setMessage(`拾取星果，连击提升到 x${state.combo}`);
  }

  renderHud();
}

function collectGlider(item) {
  item.remove();
  state.pickupsOnField = state.pickupsOnField.filter((entry) => entry !== item);
  state.gliderTimeLeft = gliderDurationMs;
  state.player.extraJumpsLeft = state.player.y > 0 ? 1 : 0;
  state.score += 24;
  setMessage("拾取滑翔机，10 秒内可使用二连跳");
  renderHud();
}

function collectArmor(item) {
  item.remove();
  state.pickupsOnField = state.pickupsOnField.filter((entry) => entry !== item);
  state.hasArmor = true;
  state.armorCollected = true;
  state.score += 20;
  setMessage("拾取铠甲，获得一次免死保护");
  renderHud();
}

function collectExpFruit(item) {
  item.remove();
  state.pickupsOnField = state.pickupsOnField.filter((entry) => entry !== item);
  state.expFruit += 1;
  state.score += 16;

  if (state.expFruit >= expFruitTarget && !state.humanSkin) {
    state.humanSkin = true;
    state.hasArmor = false;
    setMessage("经验升级完成，已切换为小人皮肤");
  } else {
    setMessage(`拾取经验果，升级进度 ${state.expFruit}/${expFruitTarget}`);
  }

  renderHud();
}

function collectPickup(item) {
  const variant = item.dataset.variant;

  if (variant === "glider") {
    collectGlider(item);
    return;
  }

  if (variant === "armor") {
    collectArmor(item);
    return;
  }

  if (variant === "expfruit") {
    collectExpFruit(item);
    return;
  }

  collectStandardPickup(item);
}

function shatterObstacle(obstacle) {
  obstacle.remove();
  state.obstacles = state.obstacles.filter((entry) => entry !== obstacle);
  state.score += 30;
  setMessage("冲刺中撞碎障碍，继续推进");
  renderHud();
}

function updatePlayer(deltaScale) {
  if (state.player.y > 0 || state.player.velocityY !== 0) {
    state.player.velocityY += gravity * deltaScale;
    state.player.y -= state.player.velocityY * deltaScale;
  }

  if (state.player.y < 0) {
    state.player.y = 0;
    state.player.velocityY = 0;
    state.player.extraJumpsLeft = state.gliderTimeLeft > 0 ? 1 : 0;
    player.classList.remove("jumping");
    player.classList.remove("double-jumping");
  }

  player.style.bottom = `${groundY + state.player.y}px`;
}

function playerRect() {
  const left = playerLeft();
  return {
    left,
    right: left + state.player.width,
    bottom: groundY + state.player.y,
    top: groundY + state.player.y + state.player.height,
  };
}

function overlaps(rectA, rectB, paddingX = 0, paddingY = 0) {
  return (
    rectA.right - paddingX > rectB.left &&
    rectA.left + paddingX < rectB.right &&
    rectA.top - paddingY > rectB.bottom &&
    rectA.bottom + paddingY < rectB.top
  );
}

function moveCollection(items, speedFactor, onCollide) {
  const currentPlayerRect = playerRect();

  return items.filter((item) => {
    const width = Number(item.dataset.width);
    const height = Number(item.dataset.height);
    const bottom = Number(item.dataset.bottom);
    const nextX = Number(item.dataset.x) - speedFactor;

    item.dataset.x = nextX;
    item.style.left = `${nextX}px`;

    if (nextX < -width - 40) {
      item.remove();
      return false;
    }

    const rect = {
      left: nextX,
      right: nextX + width,
      bottom,
      top: bottom + height,
    };

    if (onCollide(currentPlayerRect, rect, item)) {
      return false;
    }

    return true;
  });
}

function moveEntities(deltaScale) {
  const travel = state.speed * deltaScale * 6;

  state.obstacles = moveCollection(state.obstacles, travel, (currentPlayerRect, rect, obstacle) => {
    if (overlaps(currentPlayerRect, rect, 8, 6)) {
      if (state.boostTimeLeft > 0) {
        shatterObstacle(obstacle);
        return true;
      }

      if (state.hasArmor) {
        state.hasArmor = false;
        obstacle.remove();
        state.score += 12;
        setMessage("铠甲破碎，替你挡下了这次撞击");
        renderHud();
        return true;
      }

      endGame();
      obstacle.remove();
      return true;
    }

    return false;
  });

  state.pickupsOnField = moveCollection(
    state.pickupsOnField,
    travel * 0.94,
    (currentPlayerRect, rect, pickup) => {
      if (overlaps(currentPlayerRect, rect, -2, -2)) {
        collectPickup(pickup);
        return true;
      }

      return false;
    }
  );
}

function updateSpawning(deltaScale) {
  state.obstacleSpawnTimer += deltaScale;
  state.pickupSpawnTimer += deltaScale;

  if (state.obstacleSpawnTimer >= state.nextObstacleIn) {
    createEntity("obstacle");
    state.obstacleSpawnTimer = 0;
    state.nextObstacleIn = Math.max(52, 102 - state.speed * 1.9) + Math.random() * 32;
  }

  if (state.pickupSpawnTimer >= state.nextPickupIn) {
    createEntity("pickup");
    state.pickupSpawnTimer = 0;
    state.nextPickupIn = 50 + Math.random() * 52;
  }
}

function updateProgress(deltaMs) {
  state.distance += deltaMs * 0.01;
  state.score += (deltaMs * 0.01) * Math.max(1, state.combo * 0.4);

  const boostActive = state.boostTimeLeft > 0;
  const speedTier = Math.floor(state.score / scoreTierInterval);
  const tieredBaseSpeed = initialSpeed + state.distance * 0.0052 + speedTier * speedTierBonus;
  const tieredMaxSpeed = maxSpeed + speedTier * speedTierBonus;

  state.speed = Math.min(tieredMaxSpeed, tieredBaseSpeed) + (boostActive ? boostSpeedBonus : 0);

  if (state.comboTimer > 0) {
    state.comboTimer -= deltaMs;
  } else if (state.combo > 1) {
    state.combo = 1;
    setMessage("连击中断，重新收集星果恢复倍率");
  }

  if (boostActive) {
    state.boostTimeLeft = Math.max(0, state.boostTimeLeft - deltaMs);
    state.boostMeter = Math.max(0, (state.boostTimeLeft / boostDurationMs) * 100);

    if (state.boostTimeLeft === 0) {
      player.classList.remove("boosting");
      setMessage("冲刺结束，继续积攒能量后手动释放");
    }
  }

  if (state.humanSkin && state.player.ducking && !boostActive && state.boostMeter < 100) {
    const previousBoostMeter = state.boostMeter;
    state.boostMeter = Math.min(100, state.boostMeter + (deltaMs / 1000) * humanChargePerSecond);

    if (previousBoostMeter < 100 && state.boostMeter >= 100) {
      setMessage("小人下蹲蓄力完成，按向前键释放冲刺");
    }
  }

  if (state.gliderTimeLeft > 0) {
    state.gliderTimeLeft = Math.max(0, state.gliderTimeLeft - deltaMs);

    if (state.gliderTimeLeft === 0) {
      state.player.extraJumpsLeft = 0;
      setMessage("滑翔机效果结束，恢复单次跳跃");
    }
  }

  if (state.score > state.bestScore) {
    state.bestScore = Math.floor(state.score);
    localStorage.setItem(bestStorageKey, String(state.bestScore));
  }

  renderHud();
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  player.classList.remove("running", "boosting");
  document.body.classList.add("game-over");
  document.body.classList.remove("boost-active");
  setMessage("被障碍拦下来了，按空格或“重开”继续");
}

function gameLoop(timestamp) {
  if (!state.running || state.paused || state.gameOver) {
    return;
  }

  const deltaMs = Math.min(32, timestamp - state.lastTime || 16);
  const deltaScale = deltaMs / 16.67;
  state.lastTime = timestamp;

  updatePlayer(deltaScale);
  updateSpawning(deltaScale);
  moveEntities(deltaScale);
  updateProgress(deltaMs);

  if (!state.gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

function handleKeyDown(event) {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();

    if (state.gameOver) {
      restartGame();
      startGame();
      return;
    }

    jump();
  }

  if (event.code === "ArrowDown") {
    event.preventDefault();
    setDuck(true);
  }

  if (event.code === "ArrowRight" || event.code === "KeyD") {
    event.preventDefault();
    triggerBoost();
  }

  if (event.code === "KeyP") {
    event.preventDefault();

    if (!state.started) {
      startGame();
      return;
    }

    pauseGame();
  }
}

function handleKeyUp(event) {
  if (event.code === "ArrowDown") {
    event.preventDefault();
    setDuck(false);
  }
}

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", pauseGame);
restartButton.addEventListener("click", () => {
  restartGame();
  startGame();
});
jumpButton.addEventListener("click", jump);
boostButton.addEventListener("click", triggerBoost);
duckButton.addEventListener("pointerdown", () => setDuck(true));
duckButton.addEventListener("pointerup", () => setDuck(false));
duckButton.addEventListener("pointerleave", () => setDuck(false));
duckButton.addEventListener("pointercancel", () => setDuck(false));
boostButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  triggerBoost();
});
duckButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  setDuck(true);
});
duckButton.addEventListener("touchend", (event) => {
  event.preventDefault();
  setDuck(false);
});
duckButton.addEventListener("touchcancel", (event) => {
  event.preventDefault();
  setDuck(false);
});

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
