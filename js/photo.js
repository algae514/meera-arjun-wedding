(() => {
  const canvas = document.getElementById("photo-canvas");
  const ctx = canvas.getContext("2d");
  const SRC = "images/prewed-pic1.png";

  let dpr = 1;
  let photo = null;
  let fitted = null;
  let brush = null;
  let stamps = [];
  let mask = null;
  let maskCtx = null;
  let lastUntil = -1;

  function seeded(n) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function scrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 1;
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  function fitCover(iw, ih, cw, ch) {
    const scale = Math.max(cw / iw, ch / ih);
    const w = iw * scale;
    const h = ih * scale;
    return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
  }

  function bakeBrush() {
    const w = 120;
    const h = 72;
    brush = document.createElement("canvas");
    brush.width = w;
    brush.height = h;
    const c = brush.getContext("2d");
    const hairs = 15;
    for (let i = 0; i < hairs; i += 1) {
      const u = i / (hairs - 1);
      const x = lerp(14, w - 14, u) + (seeded(i * 1.7) - 0.5) * 3;
      const lean = (u - 0.5) * 10;
      const len = lerp(h * 0.72, h * 0.96, seeded(i * 2.2));
      const thick = lerp(5.5, 9.5, seeded(i * 3.1));
      const g = c.createLinearGradient(x, 8, x + lean, 8 + len);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.12, "rgba(255,255,255,0.35)");
      g.addColorStop(0.45, "rgba(255,255,255,0.92)");
      g.addColorStop(0.82, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.strokeStyle = g;
      c.lineWidth = thick;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(x, 10);
      c.quadraticCurveTo(x + lean * 0.4, 10 + len * 0.45, x + lean, 8 + len);
      c.stroke();
    }
  }

  function bakeFitted(width, height) {
    const dest = fitCover(photo.width, photo.height, width, height);
    fitted = document.createElement("canvas");
    fitted.width = Math.ceil(width * dpr);
    fitted.height = Math.ceil(height * dpr);
    const c = fitted.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalAlpha = 0.46;
    c.drawImage(photo, dest.x, dest.y, dest.w, dest.h);
    c.globalAlpha = 1;
  }

  function makePath(width, height) {
    stamps = [];
    const rowH = 34;
    const points = [];
    let row = 0;
    for (let y = -28; y < height + 40; y += rowH) {
      const left = -50;
      const right = width + 50;
      const goRight = row % 2 === 0;
      const x0 = goRight ? left : right;
      const x1 = goRight ? right : left;
      const steps = Math.ceil(width / 18);
      for (let i = 0; i <= steps; i += 1) {
        const u = i / steps;
        const x = lerp(x0, x1, u);
        const wave = Math.sin(u * Math.PI * 2.2 + row * 0.7) * 10;
        const wob = (seeded(row * 8 + i * 0.4) - 0.5) * 8;
        points.push({
          x,
          y: y + wave + wob,
        });
      }
      row += 1;
    }

    let dist = 0;
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const p = points[i];
      dist += Math.hypot(p.x - prev.x, p.y - prev.y);
      const angle = Math.atan2(p.y - prev.y, p.x - prev.x);
      const press = 0.82 + seeded(i * 0.21) * 0.28;
      stamps.push({
        x: p.x,
        y: p.y,
        rot: angle,
        w: 78 * press,
        h: 44 * press,
        t: dist,
      });
    }
    stamps.forEach((s) => {
      s.t /= dist;
    });
  }

  function rebuildMask(until) {
    if (!maskCtx || !brush) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maskCtx.clearRect(0, 0, width, height);
    for (let i = 0; i < stamps.length; i += 1) {
      const s = stamps[i];
      if (s.t > until) break;
      maskCtx.save();
      maskCtx.translate(s.x, s.y);
      maskCtx.rotate(s.rot);
      maskCtx.drawImage(brush, -s.w / 2, -s.h / 2, s.w, s.h);
      maskCtx.restore();
    }
    lastUntil = until;
  }

  function paint() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);
    if (!fitted) return;

    const until = scrollProgress();
    if (Math.abs(until - lastUntil) > 0.002) rebuildMask(until);

    ctx.drawImage(fitted, 0, 0, width, height);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }

  function resize() {
    if (!photo) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    mask = document.createElement("canvas");
    mask.width = canvas.width;
    mask.height = canvas.height;
    maskCtx = mask.getContext("2d");
    lastUntil = -1;

    bakeBrush();
    bakeFitted(width, height);
    makePath(width, height);
    paint();
  }

  const image = new Image();
  image.onload = () => {
    photo = image;
    resize();
  };
  image.src = SRC;

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        paint();
        ticking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", resize);
})();
