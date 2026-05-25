// ─── OBSTACLES ───────────────────────────────────────────────────

let obstacles     = [];
let spawnTimer    = 0;
let spawnInterval = 90;
let obstacleSpeed = 3;

const ASTEROID_COLORS = ['#ff4444', '#ff8800', '#ff44ff', '#ffff00'];

function spawnObstacle() {
  const size = randomBetween(18, 42);
  obstacles.push({
    x:             canvas.width + size,
    y:             randomBetween(size, canvas.height - size),
    size,
    color:         ASTEROID_COLORS[Math.floor(Math.random() * ASTEROID_COLORS.length)],
    rotation:      0,
    rotationSpeed: randomBetween(-0.04, 0.04),
    points:        generateAsteroidShape(size)
  });
}

function generateAsteroidShape(size) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const angle  = (i / 8) * Math.PI * 2;
    const radius = size * randomBetween(0.7, 1.0);
    pts.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
  return pts;
}

function updateObstacles() {
  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnObstacle();
  }
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x        -= obstacleSpeed;
    obstacles[i].rotation += obstacles[i].rotationSpeed;
    if (obstacles[i].x < -60) obstacles.splice(i, 1);
  }
}

function drawObstacles() {
  obstacles.forEach(ob => {
    ctx.save();
    ctx.translate(ob.x, ob.y);
    ctx.rotate(ob.rotation);
    ctx.shadowColor = ob.color;
    ctx.shadowBlur  = 16;
    ctx.fillStyle   = ob.color + '88';
    ctx.strokeStyle = ob.color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(ob.points[0].x, ob.points[0].y);
    ob.points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

function checkCollisions() {
  if (!player.alive) return;
  for (let ob of obstacles) {
    const hitboxShrink = 8;
    if (rectsOverlap(
      player.x, player.y, player.width - hitboxShrink, player.height - hitboxShrink,
      ob.x, ob.y, ob.size * 1.4, ob.size * 1.4
    )) {
      player.alive = false;
      triggerExplosion(player.x, player.y);
      startScreenShake(12, 18);
      playExplosion();
      stopEngine();
      stopMusic();
      break;
    }
  }
}

function resetObstacles() {
  obstacles     = [];
  spawnTimer    = 0;
  spawnInterval = 90;
  obstacleSpeed = 3;
}