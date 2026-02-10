// Initialisierung der Variablen
let score = 0;
let pointsPerClick = 1;
let heartsPerClick = 3;
let upgradeLevel = 0;
let upgradeCost = 10;
let autoLevel = 0;
let autoRate = 0;
let autoUpgradeCost = 50;
const goalScore = 1_000_000;
const heart = document.getElementById('heart');
const scoreDisplay = document.getElementById('score');
const goalScoreDisplay = document.getElementById('goal-score');
const gameArea = document.getElementById('game-area');
const backgroundLayer = document.getElementById('background-layer');
const foregroundLayer = document.getElementById('foreground-layer');
const upgradeButton = document.getElementById('upgrade-button');
const upgradeCostDisplay = document.getElementById('upgrade-cost');
const upgradeLevelDisplay = document.getElementById('upgrade-level');
const autoUpgradeButton = document.getElementById('auto-upgrade-button');
const autoUpgradeCostDisplay = document.getElementById('auto-upgrade-cost');
const autoLevelDisplay = document.getElementById('auto-level');
const autoRateDisplay = document.getElementById('auto-rate');
const progressFill = document.getElementById('progress-fill');
const heartOpenImage = 'pictures/hearth_open.png';
const heartClosedImage = 'pictures/hearth_closed.png';
const pulseDurationMs = 350;
const closedDurationMs = 220;

function spawnBurst(x, y) {
  const burst = document.createElement('span');
  burst.className = 'burst-heart';
  const size = 96;
  burst.style.left = `${x - size / 2}px`;
  burst.style.top = `${y - size / 2}px`;
  gameArea.appendChild(burst);

  window.setTimeout(() => {
    burst.remove();
  }, 900);
}

function spawnBackgroundHeart() {
  const heartElement = document.createElement('span');
  heartElement.className = 'background-heart';

  const targetLayer = Math.random() < 0.4 ? foregroundLayer : backgroundLayer;
  const areaWidth = targetLayer.clientWidth;
  const areaHeight = targetLayer.clientHeight;
  const size = 50 + Math.random() * 90;
  const x = Math.random() * (areaWidth - size);
  const y = Math.random() * (areaHeight - size);
  const duration = 2500 + Math.random() * 1500;

  heartElement.style.width = `${size}px`;
  heartElement.style.height = `${size}px`;
  heartElement.style.left = `${x}px`;
  heartElement.style.top = `${y}px`;
  heartElement.style.animationDuration = `${duration}ms`;

  targetLayer.appendChild(heartElement);

  window.setTimeout(() => {
    heartElement.remove();
  }, duration);
}

function updateUpgradeUI() {
  upgradeCostDisplay.textContent = upgradeCost;
  upgradeLevelDisplay.textContent = upgradeLevel;
  upgradeButton.disabled = score < upgradeCost;
  autoUpgradeCostDisplay.textContent = autoUpgradeCost;
  autoLevelDisplay.textContent = autoLevel;
  autoRateDisplay.textContent = autoRate;
  autoUpgradeButton.disabled = score < autoUpgradeCost;
}

function updateProgress() {
  const percent = Math.min(score / goalScore, 1) * 100;
  progressFill.style.height = `${percent}%`;
}

// Klick-Event für das Herz
heart.addEventListener('click', (event) => {
  score += pointsPerClick;
  scoreDisplay.textContent = score;
  const areaRect = gameArea.getBoundingClientRect();
  const burstX = event.clientX - areaRect.left;
  const burstY = event.clientY - areaRect.top;
  spawnBurst(burstX, burstY);

  for (let i = 0; i < heartsPerClick; i += 1) {
    spawnBackgroundHeart();
  }

  heart.style.backgroundImage = `url("${heartClosedImage}")`;
  heart.classList.remove('is-pulsing');
  void heart.offsetWidth;
  heart.classList.add('is-pulsing');

  window.setTimeout(() => {
    heart.style.backgroundImage = `url("${heartOpenImage}")`;
  }, closedDurationMs);

  window.setTimeout(() => {
    heart.classList.remove('is-pulsing');
  }, pulseDurationMs);

  updateUpgradeUI();
  updateProgress();
});

upgradeButton.addEventListener('click', () => {
  if (score < upgradeCost) {
    return;
  }

  score -= upgradeCost;
  upgradeLevel += 1;
  pointsPerClick += 1;
  heartsPerClick += 1;
  upgradeCost = Math.round(upgradeCost * 1.6);

  scoreDisplay.textContent = score;
  updateUpgradeUI();
  updateProgress();
});

autoUpgradeButton.addEventListener('click', () => {
  if (score < autoUpgradeCost) {
    return;
  }

  score -= autoUpgradeCost;
  autoLevel += 1;
  autoRate += 1;
  autoUpgradeCost = Math.round(autoUpgradeCost * 1.7);

  scoreDisplay.textContent = score;
  updateUpgradeUI();
  updateProgress();
});

window.setInterval(() => {
  if (autoRate <= 0) {
    return;
  }

  score += autoRate;
  scoreDisplay.textContent = score;
  for (let i = 0; i < autoRate; i += 1) {
    spawnBackgroundHeart();
  }
  updateUpgradeUI();
  updateProgress();
}, 1000);

goalScoreDisplay.textContent = goalScore.toLocaleString('de-DE');
updateUpgradeUI();
updateProgress();
