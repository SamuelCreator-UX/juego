
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const restartButton = document.getElementById("restart");

const dragonImage = new Image();
dragonImage.src = "dragon.png";

const W = canvas.width;
const H = canvas.height;
const ground = 245;

// Personaje
const dragon = {
  x: 65,
  y: ground - 60,
  width: 60,
  height: 60,
  velocityY: 0,
  gravity: 0.65,
  jumpPower: -12,
  onGround: true
};

let obstacles = [];
let particles = [];
let score = 0;
let best = 0;
let speed = 5;
let frame = 0;
let spawnTimer = 0;
let gameOver = false;
let started = false;

// Dibuja una pose de la cuadrícula de 4 x 4.
// Cada celda de tu imagen mide 64 x 64 píxeles.
function drawDragon() {
  if (dragonImage.complete && dragonImage.naturalWidth > 0) {
    const cell = 64;

    // Alterna entre dos poses de la primera fila.
    const animationFrame = dragon.onGround
      ? Math.floor(frame / 10) % 2
      : 0;

    ctx.drawImage(
      dragonImage,
      animationFrame * cell, 0, cell, cell,
      dragon.x, dragon.y,
      dragon.width, dragon.height
    );
  } else {
    // Personaje provisional mientras carga la imagen.
    ctx.fillStyle = "#0876cf";
    ctx.fillRect(dragon.x, dragon.y, 45, 45);
  }
}

// Crear obstáculos
function createObstacle() {
  const height = 30 + Math.random() * 30;

  obstacles.push({
    x: W + 20,
    y: ground - height,
    width: 25 + Math.random() * 12,
    height: height
  });
}

// Dibujar obstáculos estilo pixel art
function drawObstacle(obstacle) {
  ctx.fillStyle = "#245d38";

  // Tronco
  ctx.fillRect(
    obstacle.x + obstacle.width * 0.3,
    obstacle.y,
    obstacle.width * 0.4,
    obstacle.height
  );

  // Ramas
  ctx.fillRect(
    obstacle.x,
    obstacle.y + obstacle.height * 0.3,
    obstacle.width * 0.4,
    7
  );

  ctx.fillRect(
    obstacle.x + obstacle.width * 0.6,
    obstacle.y + obstacle.height * 0.55,
    obstacle.width * 0.4,
    7
  );
}

// Saltar
function jump() {
  if (gameOver) {
    resetGame();
    started = true;
    return;
  }

  started = true;

  if (dragon.onGround) {
    dragon.velocityY = dragon.jumpPower;
    dragon.onGround = false;
  }
}

// Controles del teclado
document.addEventListener("keydown", (event) => {
  if (
    event.code === "Space" ||
    event.code === "ArrowUp"
  ) {
    event.preventDefault();

    if (!event.repeat) {
      jump();
    }
  }
});

// Controles táctiles y clic
canvas.addEventListener("pointerdown", jump);

// Botón para reiniciar
restartButton.addEventListener("click", resetGame);

// Colisión entre dos rectángulos
function collides(a, b) {
  const padding = 10;

  return (
    a.x + padding < b.x + b.width &&
    a.x + a.width - padding > b.x &&
    a.y + padding < b.y + b.height &&
    a.y + a.height - padding > b.y
  );
}

// Fondo
function drawBackground() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Nubes
  ctx.fillStyle = "#dceeff";

  ctx.fillRect(130, 55, 65, 10);
  ctx.fillRect(150, 45, 35, 10);

  ctx.fillRect(490, 85, 70, 10);
  ctx.fillRect(510, 75, 35, 10);

  // Suelo
  ctx.fillStyle = "#245d38";
  ctx.fillRect(0, ground, W, 3);

  ctx.fillStyle = "#b7d9b0";

  for (let x = -(frame * speed * 0.5) % 45;
       x < W;
       x += 45) {
    ctx.fillRect(x, ground + 13, 20, 2);
  }
}

// Pantalla de fin
function drawGameOver() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#123b67";
  ctx.textAlign = "center";
  ctx.font = "bold 34px monospace";
  ctx.fillText("¡FIN DEL JUEGO!", W / 2, 120);

  ctx.font = "18px monospace";
  ctx.fillText("Puntuación: " + Math.floor(score), W / 2, 158);
  ctx.fillText("Pulsa ESPACIO para reintentar", W / 2, 192);
}

// Actualización del juego
function update() {
  frame++;

  if (!started || gameOver) return;

  // Física del salto
  dragon.velocityY += dragon.gravity;
  dragon.y += dragon.velocityY;

  if (dragon.y + dragon.height >= ground) {
    dragon.y = ground - dragon.height;
    dragon.velocityY = 0;
    dragon.onGround = true;
  }

  // Crear obstáculos
  spawnTimer--;

  if (spawnTimer <= 0) {
    createObstacle();
    spawnTimer = 65 + Math.random() * 45;
  }

  // Mover obstáculos
  for (const obstacle of obstacles) {
    obstacle.x -= speed;

    if (collides(dragon, obstacle)) {
      gameOver = true;
      best = Math.max(best, Math.floor(score));
      break;
    }
  }

  obstacles = obstacles.filter(
    obstacle => obstacle.x + obstacle.width > 0
  );

  // Puntuación y velocidad
  score += 0.1;
  speed = Math.min(11, 5 + score / 250);

  scoreText.textContent = "Puntos: " + Math.floor(score);
  bestText.textContent = "Récord: " + best;
}

// Dibujar todo
function draw() {
  drawBackground();
  drawDragon();

  for (const obstacle of obstacles) {
    drawObstacle(obstacle);
  }

  if (!started && !gameOver) {
    ctx.fillStyle = "#123b67";
    ctx.textAlign = "center";
    ctx.font = "18px monospace";
    ctx.fillText(
      "Pulsa ESPACIO para comenzar",
      W / 2,
      145
    );
  }

  if (gameOver) {
    drawGameOver();
  }
}

// Reiniciar
function resetGame() {
  dragon.y = ground - dragon.height;
  dragon.velocityY = 0;
  dragon.onGround = true;

  obstacles = [];
  score = 0;
  speed = 5;
  spawnTimer = 50;
  frame = 0;
  gameOver = false;
  started = false;

  scoreText.textContent = "Puntos: 0";
}

// Bucle principal
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

dragonImage.onload = () => {
  draw();
};

loop();