// Initialisierung der Variablen
let score = 0;
const heart = document.getElementById('heart');
const scoreDisplay = document.getElementById('score');

// Funktion, um das Herz an eine zufällige Position zu bewegen
function moveHeart() {
  const gameArea = document.getElementById('game-area');
  const areaWidth = gameArea.offsetWidth;
  const areaHeight = gameArea.offsetHeight;

  const heartSize = heart.offsetWidth;

  const randomX = Math.random() * (areaWidth - heartSize);
  const randomY = Math.random() * (areaHeight - heartSize);

  heart.style.left = `${randomX}px`;
  heart.style.top = `${randomY}px`;
}

// Klick-Event für das Herz
heart.addEventListener('click', () => {
  score++;
  scoreDisplay.textContent = score;
  moveHeart();
});

// Herz initial positionieren
moveHeart();
