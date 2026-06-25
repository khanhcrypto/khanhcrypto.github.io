/**
 * Full-viewport canvas particle network + radial mouse-glow background.
 * Ported from https://github.com/S0ul3r/S0ul3r.github.io (src/particles.js + src/main.js).
 */
(function () {
  var CONFIG = {
    colors: ['#58a6ff', '#22d3ee', '#38bdf8', '#06b6d4'],
    lineDistancePx: 140,
    mouseRadiusPx: 150,
    mouseForce: 0.8,
    velocityDamping: 0.98,
    idleJitter: 0.05,
    particleCountDesktop: 120,
    particleCountMobile: 60,
    mobileBreakpointPx: 768,
    resizeDebounceMs: 120,
  };

  var mouse = { x: -9999, y: -9999 };

  function createParticle(w, h) {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.5 + Math.random(),
      color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
      opacity: 0.3 + Math.random() * 0.3,
    };
  }

  function applyPhysics(p, w, h) {
    var dx = p.x - mouse.x;
    var dy = p.y - mouse.y;
    var dist = Math.hypot(dx, dy);

    if (dist < CONFIG.mouseRadiusPx && dist > 0) {
      var force = (1 - dist / CONFIG.mouseRadiusPx) * CONFIG.mouseForce;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    p.vx *= CONFIG.velocityDamping;
    p.vy *= CONFIG.velocityDamping;

    if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * CONFIG.idleJitter;
    if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * CONFIG.idleJitter;

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) {
      p.x = 0;
      p.vx *= -1;
    }
    if (p.x > w) {
      p.x = w;
      p.vx *= -1;
    }
    if (p.y < 0) {
      p.y = 0;
      p.vy *= -1;
    }
    if (p.y > h) {
      p.y = h;
      p.vy *= -1;
    }
  }

  function drawProximityLines(ctx, particles) {
    ctx.lineWidth = 0.5;
    var maxD = CONFIG.lineDistancePx;

    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var a = particles[i];
        var b = particles[j];
        var dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist >= maxD) continue;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = a.color;
        ctx.globalAlpha = (1 - dist / maxD) * 0.15;
        ctx.stroke();
      }
    }
  }

  function initParticles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'particles-bg';
    document.body.prepend(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = 0;
    var height = 0;
    var particles = [];
    var resizeTimer = 0;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function respawnParticles() {
      var count =
        window.innerWidth < CONFIG.mobileBreakpointPx ? CONFIG.particleCountMobile : CONFIG.particleCountDesktop;
      particles = Array.from({ length: count }, function () {
        return createParticle(width, height);
      });
    }

    function scheduleResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        resizeCanvas();
        respawnParticles();
      }, CONFIG.resizeDebounceMs);
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        applyPhysics(p, width, height);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      drawProximityLines(ctx, particles);
      ctx.globalAlpha = 1;

      window.requestAnimationFrame(frame);
    }

    resizeCanvas();
    respawnParticles();
    frame();

    window.addEventListener('resize', scheduleResize, { passive: true });
  }

  function initMouseGlow() {
    var glowEl = document.createElement('div');
    glowEl.id = 'mouse-glow';
    glowEl.className = 'mouse-glow';
    document.body.prepend(glowEl);

    document.addEventListener(
      'mousemove',
      function (e) {
        mouse = { x: e.clientX, y: e.clientY };
        window.requestAnimationFrame(function () {
          glowEl.style.setProperty('--glow-x', e.clientX + 'px');
          glowEl.style.setProperty('--glow-y', e.clientY + 'px');
        });
      },
      { passive: true }
    );
  }

  function bootstrap() {
    initParticles();
    initMouseGlow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
