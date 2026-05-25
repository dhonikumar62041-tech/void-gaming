// ─── PLAYER ──────────────────────────────────────────────────────

const player = {
  x: 80,
  y: 200,
  width: 36,
  height: 22,
  velocityY: 0,
  maxSpeed: 5,
  acceleration: 0.4,
  friction: 0.88,
  alive: true,
  keys: { up: false, down: false }
};

// Trail stores recent positions for the motion trail effect
const trail = [];
const TRAIL_LENGTH = 18;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp'   || e.key === 'w') player.keys.up   = true;
  if (e.key === 'ArrowDown' || e.key === 's') player.keys.down = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp'   || e.key === 'w') player.keys.up   = false;
  if (e.key === 'ArrowDown' || e.key === 's') player.keys.down = false;
});

function updatePlayer() {
  if (!player.alive) return;

  if (player.keys.up)   player.velocityY -= player.acceleration;
  if (player.keys.down) player.velocityY += player.acceleration;

  player.velocityY *= player.friction;
  player.velocityY  = clamp(player.velocityY, -player.maxSpeed, player.maxSpeed);
  player.y         += player.velocityY;
  player.y          = clamp(player.y, player.height, canvas.height - player.height);

  // Record position into trail buffer
  trail.push({ x: player.x, y: player.y });
  if (trail.length > TRAIL_LENGTH) trail.shift();  // Keep fixed length
}

function drawTrail() {
  if (!player.alive) return;

  trail.forEach((pos, i) => {
    // Older points (lower i) are more faded and smaller
    const alpha  = (i / TRAIL_LENGTH) * 0.6;
    const radius = (i / TRAIL_LENGTH) * 7;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = '#00ffff';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawPlayer() {
  if (!player.alive) return;

  const { x, y } = player;
  ctx.save();

  // Engine flame
  const flame = ctx.createRadialGradient(x - 22, y, 1, x - 22, y, 24);
  flame.addColorStop(0,   'rgba(255, 160, 0, 0.9)');
  flame.addColorStop(0.4, 'rgba(255, 80,  0, 0.5)');
  flame.addColorStop(1,   'rgba(255, 30,  0, 0)');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.arc(x - 22, y, 24, 0, Math.PI * 2);
  ctx.fill();

  // Ship glow + body
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur  = 22;
  ctx.fillStyle   = '#00ffff';
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.lineTo(x - 18, y - 11);
  ctx.lineTo(x - 18, y + 11);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.shadowBlur = 10;
  ctx.fillStyle  = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + 3, y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function resetPlayer() {
  player.x         = 80;
  player.y         = 200;
  player.velocityY = 0;
  player.alive     = true;
  player.keys.up   = false;
  player.keys.down = false;
  trail.length     = 0;   // Clear trail on reset
}