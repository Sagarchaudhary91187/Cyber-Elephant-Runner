/**
 * CYBER ELEPHANT.EXE - Hacker Matrix Web Game Engine
 * Features: Elephant Protagonist, Matrix Digital Code Rain Background,
 * Synthesized Hacker Audio, Particle Explosions, Cyber Powerups & Skins.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. SOUND SYSTEM (Web Audio API Synthesizer)
  // ==========================================================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Elephant Trumpet / Jump Sound Synth
    playJump() {
      if (!this.enabled || !this.ctx) return;
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    }

    playDoubleJump() {
      if (!this.enabled || !this.ctx) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.18);
    }

    playCrash() {
      if (!this.enabled || !this.ctx) return;
      this.init();
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    }

    playCoin() {
      if (!this.enabled || !this.ctx) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1600, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.22);
    }

    playMilestone() {
      if (!this.enabled || !this.ctx) return;
      this.init();
      const now = this.ctx.currentTime;
      [400, 600, 800, 1200].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.1);
      });
    }

    playPowerup() {
      if (!this.enabled || !this.ctx) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    }
  }

  const soundManager = new SoundManager();

  // ==========================================================================
  // 2. CONSTANTS & MATRIX PALETTES
  // ==========================================================================
  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 350;
  const GROUND_Y = 280;

  const SKINS = {
    matrix:  { name: 'Matrix',  primary: '#00ff66', secondary: '#00b347', ear: '#008033', eye: '#ffffff', glow: 'rgba(0, 255, 102, 0.5)' },
    neon:    { name: 'Cyber',   primary: '#00f3ff', secondary: '#00a6b2', ear: '#007580', eye: '#000000', glow: 'rgba(0, 243, 255, 0.5)' },
    phantom: { name: 'Phantom', primary: '#b026ff', secondary: '#7928ca', ear: '#52148d', eye: '#00ff66', glow: 'rgba(176, 38, 255, 0.5)' },
    gold:    { name: 'Gold',    primary: '#ffd700', secondary: '#ccac00', ear: '#998100', eye: '#000000', glow: 'rgba(255, 215, 0, 0.6)' }
  };

  // ==========================================================================
  // 3. MATRIX DIGITAL RAIN ENGINE
  // ==========================================================================
  const matrixChars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*<>{}[]=+/';
  const matrixColumns = Math.floor(CANVAS_WIDTH / 20);
  const matrixDrops = new Array(matrixColumns).fill(1);

  function drawMatrixRain(ctx) {
    ctx.fillStyle = 'rgba(1, 6, 3, 0.25)'; // Fade trail effect
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#00ff66';
    ctx.font = '13px "Share Tech Mono", monospace';

    for (let i = 0; i < matrixDrops.length; i++) {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * 20;
      const y = matrixDrops[i] * 18;

      ctx.globalAlpha = Math.random() * 0.4 + 0.2;
      ctx.fillText(char, x, y);

      if (y > GROUND_Y - 20 && Math.random() > 0.975) {
        matrixDrops[i] = 0;
      }
      matrixDrops[i]++;
    }
    ctx.globalAlpha = 1.0;
  }

  // ==========================================================================
  // 4. GAME STATE & PARTICLES
  // ==========================================================================
  let canvas, ctx;
  let gameState = 'START';
  let score = 0;
  let highScore = parseInt(localStorage.getItem('elephant_high_score') || '0', 10);
  let gameSpeed = 6;
  let baseSpeed = 6;
  let distanceRan = 0;
  let currentSkin = 'matrix';
  let shakeTime = 0;

  let activePowerup = null;
  let powerupTimer = 0;
  let powerupMaxDuration = 0;

  let scoreDisplay, highScoreDisplay, finalScoreDisplay, finalHighScoreDisplay;
  let overlayStart, overlayGameOver, overlayPause;
  let powerupBar, powerupIcon, powerupName, powerupFill;
  let newRecordTag, goldSkinBtn;

  let particles = [];
  let floatingTexts = [];

  class Particle {
    constructor(x, y, color, size, vx, vy, life) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = size;
      this.vx = vx;
      this.vy = vy;
      this.life = life;
      this.maxLife = life;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size); // Square digital pixels
      ctx.restore();
    }
  }

  class FloatingText {
    constructor(text, x, y, color) {
      this.text = text;
      this.x = x;
      this.y = y;
      this.color = color;
      this.life = 40;
    }

    update() {
      this.y -= 1.2;
      this.life--;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life / 40);
      ctx.font = 'bold 15px "Share Tech Mono", monospace';
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  function spawnExplosion(x, y, color, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      particles.push(new Particle(
        x, y, color,
        Math.random() * 4 + 2,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 1,
        Math.random() * 20 + 20
      ));
    }
  }

  // ==========================================================================
  // 5. ELEPHANT PLAYER CHARACTER
  // ==========================================================================
  const elephant = {
    x: 80,
    y: GROUND_Y - 56,
    width: 50,
    height: 56,
    normalHeight: 56,
    duckHeight: 34,
    vy: 0,
    gravity: 0.75,
    jumpForce: -14.0,
    isJumping: false,
    isDoubleJumping: false,
    canDoubleJump: true,
    isDucking: false,
    animFrame: 0,
    animTimer: 0,

    reset() {
      this.x = 80;
      this.y = GROUND_Y - this.normalHeight;
      this.height = this.normalHeight;
      this.vy = 0;
      this.isJumping = false;
      this.isDoubleJumping = false;
      this.canDoubleJump = true;
      this.isDucking = false;
      this.animFrame = 0;
    },

    jump() {
      if (activePowerup === 'JETPACK') {
        this.vy = -6.5;
        soundManager.playJump();
        return;
      }

      if (!this.isJumping) {
        this.isJumping = true;
        this.vy = this.jumpForce;
        this.canDoubleJump = true;
        soundManager.playJump();
        spawnExplosion(this.x + 25, GROUND_Y, '#00ff66', 8);
      } else if (this.canDoubleJump) {
        this.canDoubleJump = false;
        this.isDoubleJumping = true;
        this.vy = this.jumpForce * 0.85;
        soundManager.playDoubleJump();
        spawnExplosion(this.x + 25, this.y + this.height, SKINS[currentSkin].primary, 12);
      }
    },

    duck(enable) {
      if (this.isJumping && enable) {
        this.vy += 4.5;
      }
      if (enable && !this.isDucking) {
        this.isDucking = true;
        this.height = this.duckHeight;
        if (!this.isJumping) this.y = GROUND_Y - this.duckHeight;
      } else if (!enable && this.isDucking) {
        this.isDucking = false;
        this.height = this.normalHeight;
        if (!this.isJumping) this.y = GROUND_Y - this.normalHeight;
      }
    },

    update() {
      if (activePowerup === 'JETPACK') {
        this.y += this.vy;
        this.vy += 0.32;
        if (this.y < 50) this.y = 50;
        if (this.y > GROUND_Y - this.height) {
          this.y = GROUND_Y - this.height;
          this.vy = 0;
        }
        if (Math.random() < 0.7) {
          particles.push(new Particle(
            this.x - 4, this.y + this.height - 10,
            '#00f3ff', 3,
            -Math.random() * 4 - 2, Math.random() * 2 - 1, 15
          ));
        }
        return;
      }

      this.vy += this.gravity;
      this.y += this.vy;

      const targetGroundY = GROUND_Y - this.height;
      if (this.y >= targetGroundY) {
        if (this.isJumping) {
          spawnExplosion(this.x + 25, GROUND_Y, 'rgba(0, 255, 102, 0.4)', 6);
        }
        this.y = targetGroundY;
        this.vy = 0;
        this.isJumping = false;
        this.isDoubleJumping = false;
      }

      this.animTimer++;
      if (this.animTimer % 5 === 0) {
        this.animFrame = (this.animFrame + 1) % 2;
      }

      if (activePowerup === 'TURBO' && Math.random() < 0.8) {
        particles.push(new Particle(
          this.x, this.y + Math.random() * this.height,
          SKINS[currentSkin].primary, 3,
          -Math.random() * 3 - 2, 0, 15
        ));
      }
    },

    draw(ctx) {
      const palette = SKINS[currentSkin];
      ctx.save();

      // Shield Matrix Aura
      if (activePowerup === 'SHIELD') {
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, Math.max(this.width, this.height) * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(this.x + this.width / 2, GROUND_Y - 2, this.width * 0.6, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Pixelated Elephant Vector Sprite
      ctx.fillStyle = palette.primary;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 10;

      if (!this.isDucking) {
        // STANDING ELEPHANT
        // Main Body (Round Big Elephant Torso)
        ctx.fillRect(this.x + 10, this.y + 16, 30, 26);
        // Head
        ctx.fillRect(this.x + 24, this.y + 4, 20, 20);
        // Big Ear
        ctx.fillStyle = palette.ear;
        ctx.fillRect(this.x + 14, this.y + 6, 12, 18);
        ctx.fillStyle = palette.primary;
        // Eye
        ctx.fillStyle = palette.eye;
        ctx.fillRect(this.x + 36, this.y + 10, 4, 4);
        ctx.fillStyle = palette.primary;
        // White Tusk
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 40, this.y + 18, 6, 3);
        ctx.fillRect(this.x + 44, this.y + 15, 3, 4);
        ctx.fillStyle = palette.primary;
        // Curved Trunk (Lifted)
        ctx.fillRect(this.x + 42, this.y + 12, 6, 14);
        ctx.fillRect(this.x + 46, this.y + 20, 5, 8);
        ctx.fillRect(this.x + 44, this.y + 26, 6, 4);
        // Tail
        ctx.fillRect(this.x + 4, this.y + 22, 6, 10);

        // Legs (Sturdy Elephant Legs)
        ctx.fillStyle = palette.secondary;
        if (this.isJumping) {
          ctx.fillRect(this.x + 12, this.y + 42, 8, 10);
          ctx.fillRect(this.x + 28, this.y + 42, 8, 8);
        } else {
          if (this.animFrame === 0) {
            ctx.fillRect(this.x + 12, this.y + 42, 8, 14);
            ctx.fillRect(this.x + 28, this.y + 42, 8, 9);
          } else {
            ctx.fillRect(this.x + 12, this.y + 42, 8, 9);
            ctx.fillRect(this.x + 28, this.y + 42, 8, 14);
          }
        }
      } else {
        // CROUCHING / DUCKING ELEPHANT
        // Lowered Body
        ctx.fillRect(this.x, this.y + 8, 38, 18);
        // Extended Head
        ctx.fillRect(this.x + 30, this.y + 4, 20, 16);
        // Ear tucked back
        ctx.fillStyle = palette.ear;
        ctx.fillRect(this.x + 18, this.y + 4, 12, 14);
        ctx.fillStyle = palette.primary;
        // Eye
        ctx.fillStyle = palette.eye;
        ctx.fillRect(this.x + 42, this.y + 8, 4, 4);
        ctx.fillStyle = palette.primary;
        // Lowered Trunk forward
        ctx.fillRect(this.x + 48, this.y + 12, 10, 5);
        ctx.fillRect(this.x + 54, this.y + 15, 6, 5);
        // Crouched Legs
        ctx.fillStyle = palette.secondary;
        if (this.animFrame === 0) {
          ctx.fillRect(this.x + 6, this.y + 24, 10, 8);
          ctx.fillRect(this.x + 26, this.y + 24, 8, 8);
        } else {
          ctx.fillRect(this.x + 6, this.y + 24, 8, 8);
          ctx.fillRect(this.x + 26, this.y + 24, 10, 8);
        }
      }

      ctx.restore();
    }
  };

  // ==========================================================================
  // 6. HACKER OBSTACLES & POWERUPS
  // ==========================================================================
  let obstacles = [];
  let powerups = [];
  let obstacleTimer = 0;

  class Obstacle {
    constructor(type) {
      this.type = type;
      this.markedForDeletion = false;

      if (type === 'FIREWALL') {
        this.width = 24 + Math.floor(Math.random() * 2) * 18;
        this.height = 42;
        this.x = CANVAS_WIDTH + 20;
        this.y = GROUND_Y - this.height;
        this.color = '#ff0055';
      } else if (type === 'SERVER_NODE') {
        this.width = 30 + Math.floor(Math.random() * 2) * 22;
        this.height = 54;
        this.x = CANVAS_WIDTH + 20;
        this.y = GROUND_Y - this.height;
        this.color = '#00f3ff';
      } else if (type === 'MALWARE_DRONE') {
        this.width = 44;
        this.height = 28;
        this.x = CANVAS_WIDTH + 20;
        const heights = [GROUND_Y - 38, GROUND_Y - 68, GROUND_Y - 98];
        this.y = heights[Math.floor(Math.random() * heights.length)];
        this.color = '#ffb700';
        this.wingFrame = 0;
        this.wingTimer = 0;
      }
    }

    update(speed) {
      this.x -= speed;
      if (this.x + this.width < -50) {
        this.markedForDeletion = true;
      }

      if (this.type === 'MALWARE_DRONE') {
        this.wingTimer++;
        if (this.wingTimer % 6 === 0) {
          this.wingFrame = (this.wingFrame + 1) % 2;
        }
      }
    }

    draw(ctx) {
      ctx.save();
      if (this.type === 'FIREWALL') {
        // Red Cyber Firewall Spikes
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        for (let i = 0; i < this.width; i += 12) {
          ctx.beginPath();
          ctx.moveTo(this.x + i, GROUND_Y);
          ctx.lineTo(this.x + i + 6, GROUND_Y - this.height);
          ctx.lineTo(this.x + i + 12, GROUND_Y);
          ctx.fill();
        }
      } else if (this.type === 'SERVER_NODE') {
        // Cyber Server Rack Mainframe
        ctx.fillStyle = '#061a10';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Blinking status LED lights
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 6, this.y + 8, 6, 4);
        ctx.fillRect(this.x + 6, this.y + 20, 6, 4);
        ctx.fillRect(this.x + 6, this.y + 32, 6, 4);
      } else if (this.type === 'MALWARE_DRONE') {
        // Flying Hacker Malware Drone
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        ctx.fillRect(this.x + 10, this.y + 8, 24, 12);
        // Red Drone Eye
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(this.x + 28, this.y + 11, 6, 6);
        ctx.fillStyle = this.color;

        // Rotating Propellers
        if (this.wingFrame === 0) {
          ctx.fillRect(this.x, this.y, 14, 4);
          ctx.fillRect(this.x + 30, this.y, 14, 4);
        } else {
          ctx.fillRect(this.x, this.y + 24, 14, 4);
          ctx.fillRect(this.x + 30, this.y + 24, 14, 4);
        }
      }
      ctx.restore();
    }
  }

  class PowerupItem {
    constructor() {
      const types = ['SHIELD', 'TURBO', 'JETPACK', 'DATA_BYTE', 'DATA_BYTE'];
      this.type = types[Math.floor(Math.random() * types.length)];
      this.width = 24;
      this.height = 24;
      this.x = CANVAS_WIDTH + 20;
      this.y = GROUND_Y - 60 - Math.random() * 50;
      this.markedForDeletion = false;
      this.floatAngle = Math.random() * Math.PI * 2;
    }

    update(speed) {
      this.x -= speed;
      this.floatAngle += 0.08;
      if (this.x + this.width < -50) {
        this.markedForDeletion = true;
      }
    }

    draw(ctx) {
      ctx.save();
      const drawY = this.y + Math.sin(this.floatAngle) * 6;

      if (this.type === 'DATA_BYTE') {
        ctx.fillStyle = '#00ff66';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 16px "Share Tech Mono", monospace';
        ctx.fillText('[100]', this.x, drawY + 16);
      } else {
        ctx.font = '20px sans-serif';
        let icon = '🛡️';
        if (this.type === 'TURBO') icon = '⚡';
        if (this.type === 'JETPACK') icon = '🛸';
        ctx.fillText(icon, this.x, drawY + 18);
      }
      ctx.restore();
    }
  }

  function spawnManager() {
    obstacleTimer--;
    if (obstacleTimer <= 0) {
      const rand = Math.random();
      let type = 'FIREWALL';
      if (rand > 0.65 && distanceRan > 350) {
        type = 'MALWARE_DRONE';
      } else if (rand > 0.35) {
        type = 'SERVER_NODE';
      }
      obstacles.push(new Obstacle(type));

      const minDistance = Math.max(42, 85 - gameSpeed * 3);
      obstacleTimer = Math.floor(minDistance + Math.random() * 45);
    }

    if (Math.random() < 0.005 && powerups.length === 0) {
      powerups.push(new PowerupItem());
    }
  }

  // ==========================================================================
  // 7. HACKER MATRIX BASELINE & GRID
  // ==========================================================================
  function drawGroundGrid(ctx) {
    // Cyber Matrix Baseline Ground
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ff66';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    // Moving Cyber Baseline Grid Lines
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.2)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;

    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      const gx = (x - (distanceRan * 2) % 40 + CANVAS_WIDTH) % CANVAS_WIDTH;
      ctx.beginPath();
      ctx.moveTo(gx, GROUND_Y);
      ctx.lineTo(gx - 20, CANVAS_HEIGHT);
      ctx.stroke();
    }
  }

  // ==========================================================================
  // 8. COLLISIONS & OVERRIDES
  // ==========================================================================
  function checkCollisions() {
    const eBox = {
      x: elephant.x + 6,
      y: elephant.y + 4,
      width: elephant.width - 12,
      height: elephant.height - 8
    };

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const oBox = {
        x: obs.x + 4,
        y: obs.y + 4,
        width: obs.width - 8,
        height: obs.height - 8
      };

      if (
        eBox.x < oBox.x + oBox.width &&
        eBox.x + eBox.width > oBox.x &&
        eBox.y < oBox.y + oBox.height &&
        eBox.y + eBox.height > oBox.y
      ) {
        if (activePowerup === 'SHIELD') {
          spawnExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#00ff66', 22);
          soundManager.playCrash();
          obs.markedForDeletion = true;
          floatingTexts.push(new FloatingText('FIREWALL BREACHED!', obs.x, obs.y, '#00ff66'));
        } else {
          triggerGameOver();
          return;
        }
      }
    }

    for (let i = 0; i < powerups.length; i++) {
      const p = powerups[i];
      if (
        eBox.x < p.x + p.width &&
        eBox.x + eBox.width > p.x &&
        eBox.y < p.y + p.height &&
        eBox.y + eBox.height > p.y
      ) {
        p.markedForDeletion = true;
        if (p.type === 'DATA_BYTE') {
          score += 100;
          soundManager.playCoin();
          floatingTexts.push(new FloatingText('+100 BYTES', p.x, p.y, '#00ff66'));
          spawnExplosion(p.x, p.y, '#00ff66', 12);
        } else {
          activatePowerup(p.type);
        }
      }
    }
  }

  function activatePowerup(type) {
    activePowerup = type;
    powerupTimer = 360;
    powerupMaxDuration = 360;
    soundManager.playPowerup();

    let name = 'FIREWALL SHIELD';
    let icon = '🛡️';
    if (type === 'TURBO') { name = 'QUANTUM SPEED (2X)'; icon = '⚡'; }
    if (type === 'JETPACK') { name = 'JETPACK OVERRIDE'; icon = '🛸'; }

    powerupIcon.textContent = icon;
    powerupName.textContent = name;
    powerupBar.classList.remove('hidden');

    floatingTexts.push(new FloatingText(name, elephant.x, elephant.y - 20, '#00f3ff'));
  }

  function updatePowerup() {
    if (!activePowerup) return;
    powerupTimer--;
    const percentage = (powerupTimer / powerupMaxDuration) * 100;
    powerupFill.style.width = percentage + '%';

    if (powerupTimer <= 0) {
      activePowerup = null;
      powerupBar.classList.add('hidden');
    }
  }

  // ==========================================================================
  // 9. GAME LOOP & STATE MANAGEMENT
  // ==========================================================================
  function triggerGameOver() {
    gameState = 'GAMEOVER';
    shakeTime = 16;
    soundManager.playCrash();
    spawnExplosion(elephant.x + elephant.width / 2, elephant.y + elephant.height / 2, '#ff0055', 35);

    let isNewRecord = false;
    if (score > highScore) {
      highScore = Math.floor(score);
      localStorage.setItem('elephant_high_score', highScore.toString());
      isNewRecord = true;
    }

    finalScoreDisplay.textContent = Math.floor(score).toString();
    finalHighScoreDisplay.textContent = highScore.toString();
    highScoreDisplay.textContent = highScore.toString().padStart(5, '0');

    if (isNewRecord) newRecordTag.classList.remove('hidden');
    else newRecordTag.classList.add('hidden');

    checkGoldSkinUnlock();
    overlayGameOver.classList.remove('hidden');
  }

  function resetGame() {
    score = 0;
    gameSpeed = baseSpeed;
    distanceRan = 0;
    obstacles = [];
    powerups = [];
    particles = [];
    floatingTexts = [];
    activePowerup = null;
    powerupBar.classList.add('hidden');
    elephant.reset();
  }

  function startGame() {
    resetGame();
    gameState = 'PLAYING';
    overlayStart.classList.add('hidden');
    overlayGameOver.classList.add('hidden');
    overlayPause.classList.add('hidden');
  }

  function togglePause() {
    if (gameState === 'PLAYING') {
      gameState = 'PAUSED';
      overlayPause.classList.remove('hidden');
    } else if (gameState === 'PAUSED') {
      gameState = 'PLAYING';
      overlayPause.classList.add('hidden');
    }
  }

  function gameLoop() {
    // 1. Draw Matrix Rain Background
    drawMatrixRain(ctx);

    ctx.save();
    if (shakeTime > 0) {
      shakeTime--;
      const dx = (Math.random() - 0.5) * 10;
      const dy = (Math.random() - 0.5) * 10;
      ctx.translate(dx, dy);
    }

    // 2. Draw Baseline Grid
    drawGroundGrid(ctx);

    if (gameState === 'PLAYING') {
      const multiplier = activePowerup === 'TURBO' ? 2 : 1;
      const currentSpeed = activePowerup === 'TURBO' ? gameSpeed * 1.5 : gameSpeed;

      distanceRan += currentSpeed * 0.1;
      score += 0.16 * multiplier;
      gameSpeed = baseSpeed + Math.floor(score / 200) * 0.5;

      if (Math.floor(score) > 0 && Math.floor(score) % 100 === 0 && Math.floor(score) !== Math.floor(score - 0.16 * multiplier)) {
        soundManager.playMilestone();
      }

      scoreDisplay.textContent = Math.floor(score).toString().padStart(5, '0');

      elephant.update();
      spawnManager();
      updatePowerup();

      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update(currentSpeed);
        if (obstacles[i].markedForDeletion) obstacles.splice(i, 1);
      }

      for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].update(currentSpeed);
        if (powerups[i].markedForDeletion) powerups.splice(i, 1);
      }

      checkCollisions();
    }

    // 3. Render Entities & Visual Effects
    obstacles.forEach(obs => obs.draw(ctx));
    powerups.forEach(p => p.draw(ctx));
    elephant.draw(ctx);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      floatingTexts[i].update();
      floatingTexts[i].draw(ctx);
      if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }

    ctx.restore();

    requestAnimationFrame(gameLoop);
  }

  // ==========================================================================
  // 10. CONTROLS & EVENT LISTENERS
  // ==========================================================================
  function setupEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'START' || gameState === 'GAMEOVER') startGame();
        else if (gameState === 'PLAYING') elephant.jump();
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (gameState === 'PLAYING') elephant.duck(true);
      }
      if (e.code === 'KeyP') togglePause();
      if (e.code === 'KeyM') {
        soundManager.enabled = !soundManager.enabled;
        document.getElementById('btn-sound').querySelector('.icon').textContent = soundManager.enabled ? '🔊' : '🔇';
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowDown') {
        if (gameState === 'PLAYING') elephant.duck(false);
      }
    });

    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', startGame);
    document.getElementById('btn-resume').addEventListener('click', togglePause);
    document.getElementById('btn-pause').addEventListener('click', togglePause);

    const soundBtn = document.getElementById('btn-sound');
    soundBtn.addEventListener('click', () => {
      soundManager.enabled = !soundManager.enabled;
      soundBtn.querySelector('.icon').textContent = soundManager.enabled ? '🔊' : '🔇';
    });

    // Touch controls
    const touchJump = document.getElementById('touch-jump');
    const touchDuck = document.getElementById('touch-duck');

    touchJump.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState === 'START' || gameState === 'GAMEOVER') startGame();
      else if (gameState === 'PLAYING') elephant.jump();
    });

    touchDuck.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState === 'PLAYING') elephant.duck(true);
    });

    touchDuck.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (gameState === 'PLAYING') elephant.duck(false);
    });

    // Skin selection
    document.querySelectorAll('.skin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skinKey = btn.getAttribute('data-skin');
        if (skinKey === 'gold' && highScore < 2000) {
          alert('Reach a High Score of 2000 bytes to unlock Golden Trunk Elephant! 🏆');
          return;
        }
        document.querySelectorAll('.skin-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSkin = skinKey;
        document.getElementById('hero-avatar').textContent = skinKey === 'gold' ? '✨🐘' : '🐘';
      });
    });
  }

  function checkGoldSkinUnlock() {
    if (highScore >= 2000) {
      goldSkinBtn.title = 'Golden Elephant (UNLOCKED!)';
      goldSkinBtn.querySelector('.skin-preview').textContent = '✨🐘';
    }
  }

  // Initialize
  window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    scoreDisplay = document.getElementById('score-display');
    highScoreDisplay = document.getElementById('high-score-display');
    finalScoreDisplay = document.getElementById('final-score');
    finalHighScoreDisplay = document.getElementById('final-high-score');

    overlayStart = document.getElementById('overlay-start');
    overlayGameOver = document.getElementById('overlay-gameover');
    overlayPause = document.getElementById('overlay-pause');

    powerupBar = document.getElementById('powerup-bar');
    powerupIcon = document.getElementById('powerup-icon');
    powerupName = document.getElementById('powerup-name');
    powerupFill = document.getElementById('powerup-fill');

    newRecordTag = document.getElementById('new-record-tag');
    goldSkinBtn = document.getElementById('gold-skin-btn');

    highScoreDisplay.textContent = highScore.toString().padStart(5, '0');
    checkGoldSkinUnlock();

    setupEvents();
    requestAnimationFrame(gameLoop);
  });
})();
