(() => {
  const canvas = document.getElementById("ink-canvas");
  const ctx = canvas.getContext("2d");

  const INSET = 16;
  const STEM_SAMPLES = 260;

  const GREENS = [
    "rgba(46, 120, 58, 0.48)",
    "rgba(22, 78, 48, 0.46)",
    "rgba(168, 186, 52, 0.44)",
    "rgba(36, 128, 118, 0.40)",
    "rgba(88, 148, 42, 0.44)",
    "rgba(20, 64, 40, 0.42)",
    "rgba(120, 168, 78, 0.40)",
    "rgba(64, 108, 36, 0.42)",
    "rgba(48, 96, 78, 0.40)",
    "rgba(196, 206, 90, 0.36)",
  ];
  const BLEEDS = [
    "rgba(110, 160, 100, 0.12)",
    "rgba(70, 130, 90, 0.11)",
    "rgba(160, 176, 70, 0.10)",
    "rgba(48, 100, 78, 0.10)",
  ];
  const ROPE = "rgba(132, 92, 48, 0.55)";
  const ROPE_DARK = "rgba(88, 58, 28, 0.42)";
  const ROPE_WASH = "rgba(176, 138, 78, 0.18)";
  const STEM = "rgba(46, 92, 54, 0.55)";

  let dpr = 1;
  let stem = [];
  let motifs = [];

  function seeded(n) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function pick(list, n) {
    return list[Math.floor(seeded(n) * list.length) % list.length];
  }

  function inward(side) {
    if (side === "top") return { x: 0, y: 1 };
    if (side === "right") return { x: -1, y: 0 };
    if (side === "bottom") return { x: 0, y: -1 };
    return { x: 1, y: 0 };
  }

  function buildVine(width, height) {
    const left = INSET;
    const top = INSET;
    const right = width - INSET;
    const bottom = height - INSET;
    const w = right - left;
    const h = bottom - top;
    const segs = [
      { len: w, side: "top" },
      { len: h, side: "right" },
      { len: w, side: "bottom" },
      { len: h, side: "left" },
    ];
    const total = segs.reduce((sum, s) => sum + s.len, 0);
    const pts = [];

    for (let i = 0; i <= STEM_SAMPLES; i += 1) {
      let dist = (i / STEM_SAMPLES) * total;
      let side = "top";
      let local = 0;
      let sideLen = w;

      for (const seg of segs) {
        if (dist <= seg.len || seg.side === "left") {
          side = seg.side;
          local = Math.min(dist, seg.len);
          sideLen = seg.len;
          break;
        }
        dist -= seg.len;
      }

      const u = local / sideLen;
      let x = left;
      let y = top;
      if (side === "top") {
        x = lerp(left, right, u);
        y = top;
      } else if (side === "right") {
        x = right;
        y = lerp(top, bottom, u);
      } else if (side === "bottom") {
        x = lerp(right, left, u);
        y = bottom;
      } else {
        x = left;
        y = lerp(bottom, top, u);
      }

      const wobbleT = seeded(i * 0.37) * Math.PI * 2;
      const wave =
        4.5 * (0.5 + 0.5 * seeded(i * 0.19)) * Math.sin(i * 0.16 + wobbleT);
      const nrm = inward(side);
      x += nrm.x * (wave + 3);
      y += nrm.y * (wave + 3);

      pts.push({
        x,
        y,
        side,
        t: i / STEM_SAMPLES,
      });
    }

    for (let i = 0; i < pts.length; i += 1) {
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(pts.length - 1, i + 1)];
      pts[i].angle = Math.atan2(next.y - prev.y, next.x - prev.x);
    }

    stem = pts;
    motifs = placeMotifs(pts, total);
    motifs.forEach(bakeLeaf);
  }

  function placeMotifs(pts, perimeter) {
    const items = [];
    const knots = Math.max(36, Math.round(perimeter / 52));

    for (let n = 0; n < knots; n += 1) {
      const slot = (n + 0.5) / knots;
      const i = Math.max(0, Math.min(pts.length - 1, Math.round(slot * (pts.length - 1))));
      const p = pts[i];
      const nrm = inward(p.side);
      const hang = Math.atan2(nrm.y, nrm.x);
      const sizes = [0.7, 0.82, 0.94, 1.08, 1.22];
      const a = pick(sizes, n * 3.1);
      const b = pick(sizes, n * 5.8);

      items.push(makeLeaf(p, hang, n + 1, a, 0.34 + seeded(n) * 0.1));
      items.push(makeLeaf(p, hang, n + 40, b, -(0.34 + seeded(n + 2) * 0.1)));
    }

    return items.sort((a, b) => a.t - b.t);
  }

  function makeLeaf(p, hang, seed, scale, swing) {
    const len = lerp(46, 86, seeded(seed * 1.1)) * scale;
    const wid = len * lerp(0.2, 0.27, seeded(seed * 2.2));
    const angle = hang + swing;
    return {
      kind: "leaf",
      t: p.t,
      x: p.x,
      y: p.y,
      angle,
      length: len,
      width: wid,
      color: pick(GREENS, seed),
      colorB: pick(GREENS, seed + 4),
      colorC: pick(GREENS, seed + 9),
      bleed: pick(BLEEDS, seed + 3),
      wash: pick(GREENS, seed + 8),
      wave: 0.06 + seeded(seed * 6.3) * 0.12,
      lean: (seeded(seed * 5.2) - 0.5) * 0.16,
      seed,
    };
  }

  function leafPath(c, leaf, scale) {
    const L = leaf.length * scale;
    const W = leaf.width * scale;
    const wave = leaf.wave;
    const lean = leaf.lean;
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(L * 0.14, -W * 0.06, L * 0.26, -W * 0.62, L * 0.46, -W * (0.86 + wave));
    c.bezierCurveTo(L * 0.62, -W * 0.7, L * 0.74, -W * (0.48 - wave), L * 0.86, -W * 0.16);
    c.bezierCurveTo(L * 0.92, -W * 0.04, L * 0.95, lean * W * 0.08, L * 0.96, lean * W * 0.06);
    c.bezierCurveTo(L * 0.95, W * 0.08, L * 0.88, W * 0.18, L * 0.78, W * 0.3);
    c.bezierCurveTo(L * 0.62, W * (0.78 + wave * 0.28), L * 0.46, W * 0.74, L * 0.3, W * 0.62);
    c.bezierCurveTo(L * 0.16, W * 0.36, L * 0.08, W * 0.08, 0, 0);
    c.closePath();
  }

  function paintLeafBody(c, leaf) {
    c.strokeStyle = STEM;
    c.lineWidth = 1.2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-7, 0);
    c.quadraticCurveTo(-3, 1.1, 0, 0);
    c.stroke();
    c.strokeStyle = ROPE_DARK;
    c.lineWidth = 1.4;
    c.beginPath();
    c.arc(-1, 0, 2.1, 0, Math.PI * 2);
    c.stroke();

    c.save();
    c.filter = "blur(1.6px)";
    c.fillStyle = leaf.bleed;
    leafPath(c, leaf, 1.14);
    c.fill();
    c.filter = "none";
    c.restore();

    c.globalAlpha = 0.55;
    c.fillStyle = leaf.bleed;
    leafPath(c, leaf, 1.08);
    c.fill();
    c.globalAlpha = 1;

    leafPath(c, leaf, 1);
    c.fillStyle = leaf.color;
    c.fill();

    c.save();
    leafPath(c, leaf, 1);
    c.clip();

    const pools = [
      {
        x: leaf.length * (0.18 + seeded(leaf.seed * 1.3) * 0.2),
        y: -leaf.width * (0.05 + seeded(leaf.seed * 2.1) * 0.35),
        r: leaf.length * 0.42,
        color: leaf.colorB,
      },
      {
        x: leaf.length * (0.52 + seeded(leaf.seed * 3.2) * 0.22),
        y: leaf.width * (seeded(leaf.seed * 4.4) * 0.45 - 0.12),
        r: leaf.length * 0.38,
        color: leaf.colorC,
      },
      {
        x: leaf.length * 0.78,
        y: -leaf.width * 0.08,
        r: leaf.length * 0.32,
        color: "rgba(210, 230, 150, 0.38)",
      },
      {
        x: leaf.length * 0.22,
        y: leaf.width * 0.12,
        r: leaf.length * 0.28,
        color: "rgba(28, 70, 42, 0.28)",
      },
    ];

    pools.forEach((pool) => {
      const g = c.createRadialGradient(pool.x, pool.y, 0.8, pool.x, pool.y, pool.r);
      g.addColorStop(0, pool.color);
      g.addColorStop(0.55, leaf.wash);
      g.addColorStop(1, "rgba(40, 80, 50, 0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(pool.x, pool.y, pool.r, 0, Math.PI * 2);
      c.fill();
    });

    c.restore();

    c.strokeStyle = "rgba(28, 68, 40, 0.42)";
    c.lineWidth = Math.max(0.8, leaf.length * 0.018);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(1, 0);
    c.quadraticCurveTo(leaf.length * 0.5, leaf.width * 0.04, leaf.length * 0.98, leaf.lean * leaf.width * 0.2);
    c.stroke();
    c.strokeStyle = "rgba(28, 68, 40, 0.28)";
    c.lineWidth = 0.65;
    const pairs = 4;
    for (let v = 1; v <= pairs; v += 1) {
      const along = 0.16 + v * 0.16;
      c.beginPath();
      c.moveTo(leaf.length * along, 0);
      c.quadraticCurveTo(
        leaf.length * (along + 0.08),
        -leaf.width * 0.38,
        leaf.length * (along + 0.14),
        -leaf.width * 0.62
      );
      c.stroke();
      c.beginPath();
      c.moveTo(leaf.length * along, 0);
      c.quadraticCurveTo(
        leaf.length * (along + 0.08),
        leaf.width * 0.4,
        leaf.length * (along + 0.14),
        leaf.width * 0.64
      );
      c.stroke();
    }
  }

  function bakeLeaf(leaf) {
    const pad = 18;
    const width = Math.ceil(leaf.length * 1.25 + pad * 2);
    const height = Math.ceil(leaf.width * 2.4 + pad * 2);
    const sprite = document.createElement("canvas");
    sprite.width = Math.ceil(width * dpr);
    sprite.height = Math.ceil(height * dpr);
    const sctx = sprite.getContext("2d");
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.translate(pad, height / 2);
    paintLeafBody(sctx, leaf);
    leaf.sprite = sprite;
    leaf.spriteW = width;
    leaf.spriteH = height;
    leaf.spriteOx = pad;
    leaf.spriteOy = height / 2;
  }

  function blitLeaf(c, leaf) {
    c.save();
    c.translate(leaf.x, leaf.y);
    c.rotate(leaf.angle);
    c.drawImage(leaf.sprite, -leaf.spriteOx, -leaf.spriteOy, leaf.spriteW, leaf.spriteH);
    c.restore();
  }

  function paintStem(c, until) {
    const last = Math.max(2, Math.floor((stem.length - 1) * until));
    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";

    c.strokeStyle = ROPE_WASH;
    c.lineWidth = 3.4;
    c.beginPath();
    c.moveTo(stem[0].x, stem[0].y);
    for (let i = 1; i <= last; i += 1) c.lineTo(stem[i].x, stem[i].y);
    c.stroke();

    c.strokeStyle = ROPE;
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(stem[0].x, stem[0].y);
    for (let i = 1; i <= last; i += 1) c.lineTo(stem[i].x, stem[i].y);
    c.stroke();

    c.strokeStyle = ROPE_DARK;
    c.lineWidth = 1.15;
    c.beginPath();
    c.moveTo(stem[0].x + 1.2, stem[0].y + 1.2);
    for (let i = 1; i <= last; i += 1) {
      const n = i * 0.45;
      c.lineTo(stem[i].x + Math.sin(n) * 1.4, stem[i].y + Math.cos(n) * 1.4);
    }
    c.stroke();
    c.restore();
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
    buildVine(width, height);
    paint();
  }

  function scrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 1;
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  function paint() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    const progress = Math.max(0.14, scrollProgress());

    ctx.globalCompositeOperation = "multiply";
    paintStem(ctx, progress);

    for (const motif of motifs) {
      if (motif.t > progress) break;
      blitLeaf(ctx, motif);
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

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
  resize();
})();
