// ─── MAIN ────────────────────────────────────────────────────────

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

canvas.width  = 800;
canvas.height = 400;

// ─── RESPONSIVE SCALING ──────────────────────────────────────────
// Scales the canvas visually to fit any screen without changing
// internal resolution — so all game logic stays the same.

function resizeCanvas() {
  const maxW  = window.innerWidth;
  const maxH  = window.innerHeight * 0.78;  // Leave room for buttons
  const scale = Math.min(maxW / 800, maxH / 400);
  canvas.style.width  = (800 * scale) + 'px';
  canvas.style.height = (400 * scale) + 'px';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();   // Run once on load

// ─── GAME STATE ──────────────────────────────────────────────────

let gameState = 'menu';

// ─── SCREEN SHAKE ────────────────────────────────────────────────

let shakeAmount   = 0;
let shakeDuration = 0;

function startScreenShake(amount, duration) {
  shakeAmount   = amount;
  shakeDuration = duration;
}

function applyScreenShake() {
  if (shakeDuration <= 0) return;
  ctx.translate(
    randomBetween(-shakeAmount, shakeAmount),
    randomBetween(-shakeAmount, shakeAmount)
  );
  shakeAmount   *= 0.85;
  shakeDuration--;
}

// ─── NEBULA LAYERS (parallax background) ─────────────────────────
// Three layers of slow-moving colored clouds — creates depth

const nebulaLayers = [
  { x: 0,   y: 60,  w: 340, h: 180, color: 'rgba(80,0,140,0.13)',  speed: 0.12 },
  { x: 300, y: 200, w: 280, h: 140, color: 'rgba(0,60,160,0.10)',  speed: 0.20 },
  { x: 550, y: 30,  w: 260, h: 160, color: 'rgba(120,0,80,0.09)',  speed: 0.16 },
  { x: 150, y: 280, w: 300, h: 120, color: 'rgba(0,100,120,0.08)', speed: 0.14 },
];

function updateNebula() {
  nebulaLayers.forEach(n => {
    n.x -= n.speed;
    // Wrap around when fully off left edge
    if (n.x + n.w < 0) n.x = canvas.width;
  });
}

function drawNebula() {
  nebulaLayers.forEach(n => {
    const grad = ctx.createRadialGradient(
      n.x + n.w / 2, n.y + n.h / 2, 10,
      n.x + n.w / 2, n.y + n.h / 2, Math.max(n.w, n.h) / 2
    );
    grad.addColorStop(0, n.color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(
      n.x + n.w / 2,
      n.y + n.h / 2,
      n.w / 2,
      n.h / 2,
      0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  });
}

// ─── STARS ───────────────────────────────────────────────────────

const stars = [];
for (let i = 0; i < 140; i++) {
  stars.push({
    x:          Math.random() * 800,
    y:          Math.random() * 400,
    radius:     Math.random() * 1.6,
    speed:      Math.random() * 0.9 + 0.1,
    brightness: Math.random(),
    // Far stars (low speed) twinkle slowly, close stars twinkle fast
    twinkleSpeed: Math.random() * 0.002 + 0.0005
  });
}

function updateStars() {
  stars.forEach(s => {
    s.x -= s.speed;
    if (s.x < 0) s.x = canvas.width;
    s.brightness = 0.3 + 0.7 * Math.abs(Math.sin(Date.now() * s.twinkleSpeed + s.y));
  });
}

function drawStars() {
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.brightness})`;
    ctx.fill();
  });
}

// ─── BACKGROUND ──────────────────────────────────────────────────

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#08001a');
  grad.addColorStop(1, '#00080f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ─── PARTICLES ───────────────────────────────────────────────────

let particles = [];

function triggerExplosion(x, y) {
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(1, 7);
    particles.push({
      x, y,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      life:  1.0,
      decay: randomBetween(0.015, 0.04),
      size:  randomBetween(2, 7),
      color: ['#00ffff','#ffffff','#ff8800','#ff4444','#ff44ff'][Math.floor(Math.random() * 5)]
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x    += p.vx;
    p.y    += p.vy;
    p.vx   *= 0.97;   // Slight drag
    p.vy   *= 0.97;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 8;
    ctx.fillStyle   = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ─── PAUSE SCREEN ────────────────────────────────────────────────

function drawPauseScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur  = 36;
  ctx.fillStyle   = '#ffcc00';
  ctx.font        = 'bold 58px Courier New';
  ctx.textAlign   = 'center';
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 40);

  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur  = 14;
  ctx.fillStyle   = '#00ffff';
  ctx.font        = '22px Courier New';
  ctx.fillText('Press  P  or  ESC  to resume', canvas.width / 2, canvas.height / 2 + 20);

  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur  = 8;
  ctx.fillStyle   = '#666666';
  ctx.font        = '16px Courier New';
  ctx.fillText(`Score so far : ${score}`, canvas.width / 2, canvas.height / 2 + 58);
  ctx.restore();
}

// ─── TOGGLE PAUSE ────────────────────────────────────────────────

function togglePause() {
  if (gameState === 'playing') {
    gameState            = 'paused';
    btnPause.textContent = '▶';
    stopEngine();
    stopMusic();
  } else if (gameState === 'paused') {
    gameState            = 'playing';
    btnPause.textContent = '⏸';
    startEngine();
    startMusic();
  }
}

// ─── MAIN MENU ───────────────────────────────────────────────────

let titlePulse = 0;

function drawMenu() {
  titlePulse += 0.03;

  // Retro scanlines
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.fillRect(0, y, canvas.width, 2);
  }

  ctx.save();

  // Glowing title
  const glow = 16 + Math.sin(titlePulse) * 12;
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur  = glow;
  ctx.fillStyle   = '#00ffff';
  ctx.font        = 'bold 64px Courier New';
  ctx.textAlign   = 'center';
  ctx.fillText('VOID RUNNER', canvas.width / 2, 128);

  // Subtitle
  ctx.shadowBlur  = 6;
  ctx.fillStyle   = '#7799aa';
  ctx.font        = '17px Courier New';
  ctx.fillText('— dodge the void. survive the storm. —', canvas.width / 2, 168);

  // High score
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur  = 14;
  ctx.fillStyle   = '#ffff00';
  ctx.font        = '16px Courier New';
  ctx.fillText(`BEST SCORE : ${highScore}`, canvas.width / 2, 218);

  // Blinking prompt
  if (Math.floor(titlePulse * 4) % 2 === 0) {
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur  = 16;
    ctx.fillStyle   = '#00ffff';
    ctx.font        = 'bold 22px Courier New';
    ctx.fillText('PRESS  SPACE  TO LAUNCH', canvas.width / 2, 288);
  }

  // Controls
  ctx.shadowBlur  = 0;
  ctx.fillStyle   = '#334455';
  ctx.font        = '13px Courier New';
  ctx.fillText('W / S  or  ↑ ↓  to move   |   P or ESC to pause   |   collect ◆ for +50', canvas.width / 2, 358);

  ctx.restore();
}

// ─── GAME OVER ───────────────────────────────────────────────────

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur  = 40;
  ctx.fillStyle   = '#ff4444';
  ctx.font        = 'bold 56px Courier New';
  ctx.textAlign   = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 70);

  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur  = 10;
  ctx.fillStyle   = '#ffffff';
  ctx.font        = '24px Courier New';
  ctx.fillText(`SCORE : ${score}`, canvas.width / 2, canvas.height / 2 - 15);

  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = '#ffff00';
  ctx.font        = '20px Courier New';
  ctx.fillText(`BEST  : ${highScore}`, canvas.width / 2, canvas.height / 2 + 20);

  if (score >= highScore && score > 0) {
    ctx.shadowColor = '#00ffb3';
    ctx.shadowBlur  = 20;
    ctx.fillStyle   = '#00ffb3';
    ctx.font        = 'bold 18px Courier New';
    ctx.fillText('✦ NEW HIGH SCORE! ✦', canvas.width / 2, canvas.height / 2 + 54);
  }

  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur  = 16;
  ctx.fillStyle   = '#00ffff';
  ctx.font        = '20px Courier New';
  ctx.fillText('R — restart   |   M — main menu', canvas.width / 2, canvas.height / 2 + 95);

  ctx.restore();
}

// ─── INPUT: KEYBOARD ─────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && gameState === 'menu') {
    startGame(); return;
  }
  if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') &&
      (gameState === 'playing' || gameState === 'paused')) {
    togglePause(); return;
  }
  if ((e.key === 'r' || e.key === 'R') && gameState === 'dead') {
    restartGame(); return;
  }
  if ((e.key === 'm' || e.key === 'M') && gameState === 'dead') {
    goToMenu(); return;
  }
});

// ─── INPUT: MOBILE ───────────────────────────────────────────────

const btnUp    = document.getElementById('btnUp');
const btnDown  = document.getElementById('btnDown');
const btnPause = document.getElementById('btnPause');

btnUp.addEventListener('touchstart',   (e) => { e.preventDefault(); player.keys.up   = true;  });
btnUp.addEventListener('touchend',     (e) => { e.preventDefault(); player.keys.up   = false; });
btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); player.keys.down = true;  });
btnDown.addEventListener('touchend',   (e) => { e.preventDefault(); player.keys.down = false; });
btnUp.addEventListener('mousedown',    ()  => player.keys.up   = true);
btnUp.addEventListener('mouseup',      ()  => player.keys.up   = false);
btnDown.addEventListener('mousedown',  ()  => player.keys.down = true);
btnDown.addEventListener('mouseup',    ()  => player.keys.down = false);

btnPause.addEventListener('click', () => {
  if (gameState === 'playing' || gameState === 'paused') togglePause();
});

canvas.addEventListener('click', () => {
  if (gameState === 'menu') startGame();
});

// ─── GAME CONTROL ────────────────────────────────────────────────

function startGame() {
  initAudio();
  startEngine();
  startMusic();
  resetPlayer();
  resetObstacles();
  resetScore();
  particles            = [];
  gameState            = 'playing';
  btnPause.textContent = '⏸';
}

function restartGame() {
  particles            = [];
  resetPlayer();
  resetObstacles();
  resetScore();
  startEngine();
  startMusic();
  gameState            = 'playing';
  btnPause.textContent = '⏸';
}

function goToMenu() {
  resetPlayer();
  resetObstacles();
  resetScore();
  particles            = [];
  gameState            = 'menu';
  btnPause.textContent = '⏸';
}

// ─── GAME LOOP ───────────────────────────────────────────────────

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  applyScreenShake();

  // Background layers (always draw)
  drawBackground();
  updateNebula();
  drawNebula();
  updateStars();
  drawStars();

  if (gameState === 'menu') {
    drawPlayer();
    drawMenu();

  } else if (gameState === 'playing') {
    updatePlayer();
    updateObstacles();
    updatePickups();
    updateScore();
    checkCollisions();

    if (!player.alive) {
      gameState            = 'dead';
      btnPause.textContent = '⏸';
    }

    drawObstacles();
    drawPickups();
    drawTrail();       // ← Trail drawn BEFORE ship
    drawPlayer();
    updateParticles();
    drawParticles();
    updateScorePopups();
    drawScorePopups();
    drawScore();

  } else if (gameState === 'paused') {
    drawObstacles();
    drawPickups();
    drawTrail();
    drawPlayer();
    drawParticles();
    drawScore();
    drawPauseScreen();

  } else if (gameState === 'dead') {
    drawObstacles();
    drawPickups();
    updateParticles();
    drawParticles();
    drawGameOver();
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}

// ─── LAUNCH ──────────────────────────────────────────────────────
gameLoop();