// Initialisierung der Variablen
let score = 0;
let pointsPerClick = 1;
let heartsPerClick = 3;
let upgradeLevel = 0;
let upgradeCost = 10;
let autoLevel = 0;
let autoRate = 0;
let autoUpgradeCost = 50;
let autoAccumulator = 0;
let totalHearts = 0;
let activeBackgroundHearts = 0;
const maxBackgroundHearts = 250;
const clickBase = 1;
const clickGrowth = 1.65;
const heartsBase = 3;
const heartsGrowth = 1.45;
const autoBase = 2;
const autoGrowth = 1.75;
const goalScore = 10_000;
const heart = document.getElementById('heart');
const scoreDisplay = document.getElementById('score');
const goalCurrentDisplay = document.getElementById('goal-current');
const gameArea = document.getElementById('game-area');
const backgroundLayer = document.getElementById('background-layer');
const foregroundLayer = document.getElementById('foreground-layer');
const upgradeButton = document.getElementById('upgrade-button');
const upgradeCostDisplay = document.getElementById('upgrade-cost');
const upgradeLevelDisplay = document.getElementById('upgrade-level');
const clickRateDisplay = document.getElementById('click-rate');
const clickRateNextDisplay = document.getElementById('click-rate-next');
const autoUpgradeButton = document.getElementById('auto-upgrade-button');
const autoUpgradeCostDisplay = document.getElementById('auto-upgrade-cost');
const autoLevelDisplay = document.getElementById('auto-level');
const autoRateDisplay = document.getElementById('auto-rate');
const autoRateNextDisplay = document.getElementById('auto-rate-next');
const autoclickerSection = document.getElementById('autoclicker-section');
const cosmeticsSection = document.getElementById('cosmetics-section');
const cosmeticsList = document.getElementById('cosmetics-list');
const progressFill = document.getElementById('progress-fill');
const endScreen = document.getElementById('end-screen');
const endButtons = document.getElementById('end-buttons');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const endCard = document.querySelector('.end-card');
const testInput = document.getElementById('test-input');
const bgMusic = document.getElementById('bg-music');
const upgradeSound = new Audio('sounds/upgrade.wav');
const skinSound = new Audio('sounds/kiss.wav');
const clickSound = new Audio('sounds/kiss2.wav');
const heartSkins = [
  {
    id: 'classic',
    name: 'Klassik',
    open: 'pictures/hearth_open.png',
    closed: 'pictures/hearth_closed.png',
    cost: 0,
  },
  { id: '1', name: 'Skin 1', open: 'cosmetics/1.png', closed: 'cosmetics/1.png', cost: 1000 },
  { id: '2', name: 'Skin 2', open: 'cosmetics/2.png', closed: 'cosmetics/2.png', cost: 10000 },
  { id: '3', name: 'Skin 3', open: 'cosmetics/3.png', closed: 'cosmetics/3.png', cost: 50000 },
  { id: '4', name: 'Skin 4', open: 'cosmetics/4.png', closed: 'cosmetics/4.png', cost: 250000 },
  { id: '5', name: 'Skin 5', open: 'cosmetics/5.png', closed: 'cosmetics/5.png', cost: 500000 },
  { id: '6', name: 'Skin 6', open: 'cosmetics/6.png', closed: 'cosmetics/6.png', cost: 750000 },
  { id: '7', name: 'Skin 7', open: 'cosmetics/7.png', closed: 'cosmetics/7.png', cost: 1000000 },
];
const unlockedSkins = new Set(['classic']);
let activeSkinId = 'classic';
let currentHeartOpen = heartSkins[0].open;
let currentHeartClosed = heartSkins[0].closed;
const pulseDurationMs = 350;
const closedDurationMs = 220;
const ticksPerSecond = 5;
const tickMs = 200;
const avoidRadius = 140;
let gameCompleted = false;
let noTeleportCount = 0;
let celebrationIntervalId = null;

function formatNumber(value) {
  return Math.floor(value).toLocaleString('de-DE');
}

function updateScoreDisplay() {
  scoreDisplay.textContent = formatNumber(score);
}

function updateTotalDisplay() {
  goalCurrentDisplay.textContent = formatNumber(totalHearts);
}

function addScore(amount) {
  if (amount <= 0) {
    return;
  }
  score += amount;
  totalHearts += amount;
}

function recalcStats() {
  pointsPerClick = Math.max(1, Math.round(clickBase * Math.pow(clickGrowth, upgradeLevel)));
  heartsPerClick = Math.max(1, Math.round(heartsBase * Math.pow(heartsGrowth, upgradeLevel)));
  autoRate = autoLevel === 0
    ? 0
    : Math.max(1, Math.round(autoBase * Math.pow(autoGrowth, autoLevel - 1)));
}

function getSkinById(skinId) {
  return heartSkins.find((skin) => skin.id === skinId) || heartSkins[0];
}

function applySkin(skinId) {
  const skin = getSkinById(skinId);
  activeSkinId = skin.id;
  currentHeartOpen = skin.open;
  currentHeartClosed = skin.closed;
  heart.style.backgroundImage = `url("${currentHeartOpen}")`;
}

function playSound(audio) {
  const sound = audio.cloneNode();
  sound.volume = 0.7;
  sound.play().catch(() => {});
}

function unlockSkin(skinId) {
  if (!unlockedSkins.has(skinId)) {
    unlockedSkins.add(skinId);
    playSound(skinSound);
  }
}

function spawnBurst(x, y) {
  const burst = document.createElement('span');
  burst.className = 'burst-heart';
  const size = 96;
  burst.style.left = `${x - size / 2}px`;
  burst.style.top = `${y - size / 2}px`;
  burst.style.backgroundImage = `url("${currentHeartOpen}")`;
  gameArea.appendChild(burst);

  window.setTimeout(() => {
    burst.remove();
  }, 900);
}

function spawnBackgroundHeart() {
  if (activeBackgroundHearts >= maxBackgroundHearts) {
    return;
  }
  const heartElement = document.createElement('span');
  heartElement.className = 'background-heart';
  const unlockedList = heartSkins.filter((skin) => unlockedSkins.has(skin.id));
  const randomSkin = unlockedList[Math.floor(Math.random() * unlockedList.length)];
  heartElement.style.backgroundImage = `url("${randomSkin.open}")`;

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
  activeBackgroundHearts += 1;

  window.setTimeout(() => {
    heartElement.remove();
    activeBackgroundHearts = Math.max(0, activeBackgroundHearts - 1);
  }, duration);
}

function updateUpgradeUI() {
  const nextClickRate = Math.round(clickBase * Math.pow(clickGrowth, upgradeLevel + 1));
  const nextAutoRate = autoLevel === 0
    ? autoBase
    : Math.round(autoBase * Math.pow(autoGrowth, autoLevel));
  upgradeCostDisplay.textContent = formatNumber(upgradeCost);
  upgradeLevelDisplay.textContent = upgradeLevel;
  upgradeButton.disabled = score < upgradeCost;
  clickRateDisplay.textContent = formatNumber(pointsPerClick);
  clickRateNextDisplay.textContent = formatNumber(nextClickRate);
  const autoclickerUnlocked = upgradeLevel >= 3;
  autoclickerSection.hidden = !autoclickerUnlocked;
  autoUpgradeCostDisplay.textContent = formatNumber(autoUpgradeCost);
  autoLevelDisplay.textContent = autoLevel;
  autoRateDisplay.textContent = formatNumber(autoRate);
  autoRateNextDisplay.textContent = formatNumber(nextAutoRate);
  autoUpgradeButton.disabled = !autoclickerUnlocked || score < autoUpgradeCost;
  const cosmeticsUnlocked = autoLevel >= 4;
  cosmeticsSection.hidden = !cosmeticsUnlocked;
  if (cosmeticsUnlocked) {
    updateCosmeticsUI();
  }
}

function updateProgress() {
  const percent = Math.min(totalHearts / goalScore, 1) * 100;
  progressFill.style.height = `${percent}%`;
  if (!gameCompleted && totalHearts >= goalScore) {
    completeGame();
  }
}

function startBackgroundMusic() {
  if (!bgMusic) {
    return;
  }
  bgMusic.volume = 0.4;
  bgMusic.play().catch(() => {});
}

function celebrateYes() {
  if (celebrationIntervalId) {
    window.clearInterval(celebrationIntervalId);
  }

  for (let i = 0; i < 30; i += 1) {
    spawnBackgroundHeart();
  }

  let ticks = 0;
  celebrationIntervalId = window.setInterval(() => {
    for (let i = 0; i < 12; i += 1) {
      spawnBackgroundHeart();
    }
    ticks += 1;
    if (ticks >= 12) {
      window.clearInterval(celebrationIntervalId);
      celebrationIntervalId = null;
    }
  }, 200);
}

function completeGame() {
  gameCompleted = true;
  document.body.classList.add('is-complete');
  endScreen.hidden = false;
  progressFill.style.height = '100%';
  if (autoIntervalId) {
    window.clearInterval(autoIntervalId);
  }
  positionNoButtonUnderQuestion();
}

function positionNoButtonUnderQuestion() {
  noButton.classList.remove('is-teleporting');
  noButton.style.left = '';
  noButton.style.top = '';
  noTeleportCount = 0;
}

function addYesButton() {
  const extra = document.createElement('button');
  extra.type = 'button';
  extra.className = 'end-button yes-button floating-yes';
  extra.textContent = 'Ja';
  const buttonRect = yesButton.getBoundingClientRect();
  const maxX = window.innerWidth - buttonRect.width;
  const maxY = window.innerHeight - buttonRect.height;
  const nextX = Math.max(0, Math.random() * maxX);
  const nextY = Math.max(0, Math.random() * maxY);
  extra.style.left = `${nextX}px`;
  extra.style.top = `${nextY}px`;
  endScreen.appendChild(extra);
}

function addYesButtons(count) {
  for (let i = 0; i < count; i += 1) {
    addYesButton();
  }
}

function moveNoButton(event) {
  const buttonRect = noButton.getBoundingClientRect();
  const maxX = window.innerWidth - buttonRect.width;
  const maxY = window.innerHeight - buttonRect.height;
  if (maxX <= 0 || maxY <= 0) {
    return;
  }

  if (!noButton.classList.contains('is-teleporting')) {
    noButton.classList.add('is-teleporting');
  }

  const cursorX = event ? event.clientX : window.innerWidth / 2;
  const cursorY = event ? event.clientY : window.innerHeight / 2;

  let nextX = Math.random() * maxX;
  let nextY = Math.random() * maxY;
  let tries = 0;

  while (tries < 30) {
    const dx = nextX + buttonRect.width / 2 - cursorX;
    const dy = nextY + buttonRect.height / 2 - cursorY;
    if (Math.hypot(dx, dy) >= avoidRadius) {
      break;
    }
    nextX = Math.random() * maxX;
    nextY = Math.random() * maxY;
    tries += 1;
  }

  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;
  if (gameCompleted) {
    noTeleportCount += 1;
    addYesButtons(noTeleportCount);
  }
}

function updateCosmeticsUI() {
  cosmeticsList.innerHTML = '';

  const sortedSkins = [...heartSkins].sort((a, b) => a.cost - b.cost);
  const nextLockedIndex = sortedSkins.findIndex((skin) => !unlockedSkins.has(skin.id));
  const visibleSkins = nextLockedIndex === -1
    ? sortedSkins
    : sortedSkins.slice(0, nextLockedIndex + 1);

  visibleSkins.forEach((skin) => {
    const isUnlocked = unlockedSkins.has(skin.id);
    const canUnlock = totalHearts >= skin.cost;
    const isActive = activeSkinId === skin.id;

    const card = document.createElement('div');
    card.className = 'cosmetic-card';
    if (isActive) {
      card.classList.add('is-active');
    }
    if (!isUnlocked) {
      card.classList.add('is-locked');
      if (canUnlock) {
        card.classList.add('is-unlockable');
      }
    }

    const preview = document.createElement('div');
    preview.className = 'cosmetic-preview';
    preview.style.backgroundImage = `url("${skin.open}")`;

    const name = document.createElement('div');
    name.className = 'cosmetic-name';
    name.textContent = skin.name;

    const progress = document.createElement('div');
    progress.className = 'cosmetic-progress';
    progress.textContent = isUnlocked
      ? 'Freigeschaltet'
      : `${formatNumber(totalHearts)} / ${formatNumber(skin.cost)} Herzen`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'upgrade-button';

    if (isUnlocked) {
      button.textContent = isActive ? 'Aktiv' : 'Aktivieren';
      button.disabled = isActive;
      button.addEventListener('click', () => {
        applySkin(skin.id);
        updateCosmeticsUI();
      });
    } else {
      button.textContent = `Freischalten (${formatNumber(skin.cost)} Herzen)`;
      button.disabled = !canUnlock;
      button.hidden = !canUnlock;
      if (canUnlock) {
        button.classList.add('is-unlock');
      }
      button.addEventListener('click', () => {
        if (!canUnlock) {
          return;
        }
        unlockSkin(skin.id);
        applySkin(skin.id);
        updateCosmeticsUI();
      });
    }

    card.addEventListener('click', (event) => {
      if (event.target === button) {
        return;
      }
      if (isUnlocked) {
        applySkin(skin.id);
      } else if (canUnlock) {
        unlockSkin(skin.id);
        applySkin(skin.id);
      }
      updateCosmeticsUI();
    });

    card.appendChild(preview);
    card.appendChild(name);
    card.appendChild(progress);
    card.appendChild(button);
    cosmeticsList.appendChild(card);
  });
}

// Klick-Event für das Herz
heart.addEventListener('click', (event) => {
  if (gameCompleted) {
    return;
  }
  playSound(clickSound);
  addScore(pointsPerClick);
  updateScoreDisplay();
  updateTotalDisplay();
  const areaRect = gameArea.getBoundingClientRect();
  const burstX = event.clientX - areaRect.left;
  const burstY = event.clientY - areaRect.top;
  spawnBurst(burstX, burstY);

  for (let i = 0; i < heartsPerClick; i += 1) {
    spawnBackgroundHeart();
  }

  heart.style.backgroundImage = `url("${currentHeartClosed}")`;
  heart.classList.remove('is-pulsing');
  void heart.offsetWidth;
  heart.classList.add('is-pulsing');

  window.setTimeout(() => {
    heart.style.backgroundImage = `url("${currentHeartOpen}")`;
  }, closedDurationMs);

  window.setTimeout(() => {
    heart.classList.remove('is-pulsing');
  }, pulseDurationMs);

  updateUpgradeUI();
  updateProgress();
});

upgradeButton.addEventListener('click', () => {
  if (gameCompleted) {
    return;
  }
  if (score < upgradeCost) {
    return;
  }

  score -= upgradeCost;
  upgradeLevel += 1;
  recalcStats();
  upgradeCost = Math.round(upgradeCost * 1.6);
  playSound(upgradeSound);

  updateScoreDisplay();
  updateTotalDisplay();
  updateUpgradeUI();
  updateProgress();
});

autoUpgradeButton.addEventListener('click', () => {
  if (gameCompleted) {
    return;
  }
  if (upgradeLevel < 3 || score < autoUpgradeCost) {
    return;
  }

  score -= autoUpgradeCost;
  autoLevel += 1;
  recalcStats();
  autoUpgradeCost = Math.round(autoUpgradeCost * 1.7);
  playSound(upgradeSound);

  updateScoreDisplay();
  updateTotalDisplay();
  updateUpgradeUI();
  updateProgress();
});

const autoIntervalId = window.setInterval(() => {
  if (gameCompleted) {
    return;
  }
  if (autoRate <= 0) {
    return;
  }

  autoAccumulator += autoRate;
  const scoreThisTick = Math.floor(autoAccumulator / ticksPerSecond);
  autoAccumulator %= ticksPerSecond;
  if (scoreThisTick > 0) {
    addScore(scoreThisTick);
  }
  updateScoreDisplay();
  updateTotalDisplay();
  const heartsToSpawn = Math.round(autoRate / ticksPerSecond);
  for (let i = 0; i < heartsToSpawn; i += 1) {
    spawnBackgroundHeart();
  }
  updateUpgradeUI();
  updateProgress();
}, tickMs);

recalcStats();
applySkin(activeSkinId);
updateUpgradeUI();
updateProgress();
updateScoreDisplay();
updateTotalDisplay();
const mailtoLink = 'mailto:mauricehoefer@outlook.de?subject=Deine%20Moussentine&body=Ich%20möchte%20deine%20Moussentine%20sein!%20💖';

endScreen.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.classList.contains('yes-button')) {
    celebrateYes();
    endButtons.innerHTML = '';
    const floatingButtons = endScreen.querySelectorAll('.floating-yes, .no-button');
    floatingButtons.forEach((button) => button.remove());
    window.location.href = mailtoLink;
  }
});
noButton.addEventListener('mouseenter', moveNoButton);
noButton.addEventListener('mousedown', moveNoButton);
document.addEventListener('click', startBackgroundMusic, { once: true });
endScreen.addEventListener('mousemove', (event) => {
  if (!gameCompleted) {
    return;
  }
  const rect = noButton.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  if (Math.hypot(dx, dy) < avoidRadius) {
    moveNoButton(event);
  }
});
if (testInput) {
  testInput.addEventListener('input', (event) => {
    if (gameCompleted) {
      return;
    }
    if (event.target.value.trim().toLowerCase() === 'test') {
      completeGame();
    }
  });
}
