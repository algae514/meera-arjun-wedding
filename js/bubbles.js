(() => {
  const canvas = document.getElementById("bubble-canvas");
  const ctx = canvas.getContext("2d");
  const hint = document.getElementById("scroll-hint");
  const FONT = '"Snell Roundhand", "Apple Chancery", "Segoe Script", "Brush Script MT", Georgia, cursive';

  const GREENS = [
    [186, 214, 140],
    [140, 186, 120],
    [110, 168, 130],
    [168, 196, 88],
    [90, 150, 120],
    [200, 214, 130],
  ];

  let dpr = 1;
  let bubbles = [];
  let start = performance.now();

  function seeded(n) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function place(width, height) {
    const min = Math.min(width, height);
    bubbles = [
      {
        x: width * 0.3,
        y: height * 0.8,
        base: min * 0.28,
        stretch: 1,
        rot: 0,
        period: 14000,
        phase: 0.4,
        breathe: 0.1,
        rgb: GREENS[0],
        name: "Meera",
      },
      {
        x: width * 0.7,
        y: height * 0.84,
        base: min * 0.3,
        stretch: 1,
        rot: 0.08,
        period: 16000,
        phase: 2.1,
        breathe: 0.11,
        rgb: GREENS[2],
        name: "Arjun",
      },
    ];

    for (let i = 0; i < 10; i += 1) {
      bubbles.push({
        x: seeded(i * 1.9) * width,
        y: height * (0.68 + seeded(i * 3.4) * 0.34),
        base: lerp(min * 0.08, min * 0.2, seeded(i * 5.1)),
        stretch: lerp(0.88, 1.08, seeded(i * 2.2)),
        rot: seeded(i * 7.3) * 0.4,
        period: lerp(10000, 19000, seeded(i * 4.4)),
        phase: seeded(i * 8.8) * Math.PI * 2,
        breathe: lerp(0.08, 0.16, seeded(i * 6.6)),
        rgb: GREENS[Math.floor(seeded(i * 2.7) * GREENS.length) % GREENS.length],
        name: "",
      });
    }
  }

  function drawBubble(c, b, t) {
    const pulse = 1 + Math.sin((t * Math.PI * 2) / b.period + b.phase) * b.breathe;
    const r = b.base * pulse;
    const rx = r;
    const ry = r * b.stretch;
    const [cr, cg, cb] = b.rgb;

    c.save();
    c.translate(b.x, b.y);
    c.rotate(b.rot);

    const body = c.createRadialGradient(-rx * 0.18, -ry * 0.22, rx * 0.05, 0, 0, rx);
    body.addColorStop(0, `rgba(255,255,255,0.18)`);
    body.addColorStop(0.28, `rgba(${cr},${cg},${cb},0.1)`);
    body.addColorStop(0.7, `rgba(${cr},${cg},${cb},0.045)`);
    body.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    c.fillStyle = body;
    c.beginPath();
    c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = `rgba(${cr},${cg},${cb},0.16)`;
    c.lineWidth = Math.max(1, r * 0.018);
    c.stroke();

    c.save();
    c.globalCompositeOperation = "screen";
    const shine = c.createRadialGradient(-rx * 0.28, -ry * 0.34, 0, -rx * 0.28, -ry * 0.34, rx * 0.38);
    shine.addColorStop(0, "rgba(255,255,255,0.42)");
    shine.addColorStop(0.45, "rgba(255,255,255,0.08)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = shine;
    c.beginPath();
    c.ellipse(-rx * 0.22, -ry * 0.3, rx * 0.28, ry * 0.16, -0.5, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "rgba(255,255,255,0.28)";
    c.beginPath();
    c.ellipse(rx * 0.22, ry * 0.18, rx * 0.06, ry * 0.04, 0.6, 0, Math.PI * 2);
    c.fill();
    c.restore();

    if (b.name) {
      c.rotate(-b.rot);
      const size = r * 0.28;
      c.font = `400 ${size}px ${FONT}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = "rgba(40, 56, 32, 0.28)";
      c.fillText(b.name, 0, size * 0.06);
    }

    c.restore();
  }

  function paint(now) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);
    const t = now - start;
    bubbles.forEach((b) => drawBubble(ctx, b, t));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    place(width, height);
  }

  function loop(now) {
    paint(now);
    requestAnimationFrame(loop);
  }

  function updateHint() {
    if (!hint) return;
    hint.classList.toggle("is-hidden", window.scrollY > 24);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", updateHint, { passive: true });
  resize();
  updateHint();
  requestAnimationFrame(loop);
})();
