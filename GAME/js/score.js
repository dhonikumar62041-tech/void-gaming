// ─── SCORE & DIFFICULTY ──────────────────────────────────────────

let score          = 0;
let highScore      = parseInt(localStorage.getItem('voidRunnerHigh')) || 0;
let frameCount     = 0;
let diffLevel      = 1;
let pickups        = [];
let pickupTimer    = 0;
let pickupInterval = 180;
let scorePopups    = [];

function spawnPickup() {
  pickups.push({
    x:      canvas.width + 10,
    y:      randomBetween(30, canvas.height - 30),
    radius: 10,
    angle:  0,
    pulse:  0
  });
}

function updatePickups() {
  pickupTimer++;
  if (pickupTimer >= pickupInterval) {
    pickupTimer = 0;
    spawnPickup();
  }
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p  = pickups[i];
    p.x     -= obstacleSpeed;
    p.angle += 0.05;
    p.pulse += 0.08;
    const dx   = player.x - p.x;
    const dy   = player.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < p.radius + 16 && player.alive) {
      score += 50;
      spawnScorePopup(p.x, p.y, '+50');
      triggerCollectEffect(p.x, p.y);
      playPickup();
      pickups.splice(i, 1);
      continue;
    }
    if (p.x < -20) pickups.splice(i, 1);
  }
}

function drawPickups() {
  pickups.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const glowSize = 14 + Math.sin(p.pulse) * 4;
    const glow     = ctx.createRadialGradient(0, 0, 2, 0, 0, glowSize);
    glow.addColorStop(0, 'rgba(0,255,180,0.9)');
    glow.addColorStop(1, 'rgba(0,255,180,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#00ffb3';
    ctx.shadowBlur  = 20;
    ctx.fillStyle   = '#00ffb3';
    ctx.rotate(p.angle);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(7,   0);
    ctx.lineTo(0,  10);
    ctx.lineTo(-7,  0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

function spawnScorePopup(x, y, text) {
  scorePopups.push({ x, y, text, life: 1.0, vy: -1.5 });
}

function updateScorePopups() {
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    scorePopups[i].y    += scorePopups[i].vy;
    scorePopups[i].life -= 0.025;
    if (scorePopups[i].life <= 0) scorePopups.splice(i, 1);
  }
}

function drawScorePopups() {
  scorePopups.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.shadowColor = '#00ffb3';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = '#00ffb3';
    ctx.font        = 'bold 18px Courier New';
    ctx.textAlign   = 'center';
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  });
}

function triggerCollectEffect(x, y) {
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const speed = randomBetween(1.5, 4);
    particles.push({
      x, y,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      life:  1.0,
      decay: randomBetween(0.03, 0.06),
      size:  randomBetween(2, 4),
      color: '#00ffb3'
    });
  }
}

function updateDifficulty() {
  if (frameCount % 500 === 0 && frameCount > 0) {
    diffLevel++;
    obstacleSpeed = Math.min(obstacleSpeed + 0.4, 10);
    spawnInterval = Math.max(spawnInterval - 8, 38);
    spawnScorePopup(canvas.width / 2, canvas.height / 2, `⚡ LEVEL ${diffLevel}`);
    playLevelUp();
  }
}

function updateScore() {
  if (!player.alive) return;
  frameCount++;
  score++;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('voidRunnerHigh', highScore);
  }
  updateDifficulty();
}

function drawScore() {
  ctx.save();

  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = '#00ffff';
  ctx.font        = 'bold 20px Courier New';
  ctx.textAlign   = 'left';
  ctx.fillText(`SCORE  ${score}`, 16, 32);

  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur  = 10;
  ctx.fillStyle   = '#ffff00';
  ctx.font        = '15px Courier New';
  ctx.fillText(`BEST   ${highScore}`, 16, 56);

  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur  = 10;
  ctx.fillStyle   = '#ff8800';
  ctx.textAlign   = 'right';
  ctx.font        = '15px Courier New';
  ctx.fillText(`LVL ${diffLevel}`, canvas.width - 16, 32);

  ctx.restore();
}

function resetScore() {
  score          = 0;
  frameCount     = 0;
  diffLevel      = 1;
  pickups        = [];
  pickupTimer    = 0;
  pickupInterval = 180;
  scorePopups    = [];
}