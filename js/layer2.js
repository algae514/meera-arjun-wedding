(() => {
  const canvas = document.getElementById("rice-canvas");
  const ctx = canvas.getContext("2d");

  const FONT = '"Snell Roundhand", "Apple Chancery", "Segoe Script", "Brush Script MT", Georgia, cursive';
  const INK = "#1c120c";
  const INK_EDGE = "rgba(247, 236, 208, 0.95)";

  const SLIDES = [
    [
      { role: "kicker", text: "With their families" },
      { role: "title", text: "Meera & Arjun" },
      { role: "body", text: "request the honour of your presence" },
      { role: "body", text: "at their wedding" },
    ],
    [
      { role: "kicker", text: "The wedding" },
      { role: "title", text: "12 December" },
      { role: "body", text: "Friday, two thousand and twenty-six" },
      { role: "body", text: "at the bride's home, Hyderabad" },
    ],
    [
      { role: "kicker", text: "Muhurtham" },
      { role: "title", text: "10:16 in the morning" },
      { role: "body", text: "Followed by lunch" },
      { role: "body", text: "and the blessings of our elders" },
    ],
    [
      { role: "kicker", text: "With love" },
      { role: "title", text: "We wait for you" },
      { role: "body", text: "Your presence is the only gift we ask" },
    ],
  ];

  let dpr = 1;
  let layouts = [];

  function seeded(n) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function fontFor(role, width, height) {
    const scale = Math.min(width * 0.92, height * 1.15);
    if (role === "title") return Math.min(width * 0.13, scale * 0.14, 108);
    if (role === "kicker") return Math.min(width * 0.055, scale * 0.06, 40);
    return Math.min(width * 0.058, scale * 0.064, 44);
  }

  function setFont(c, size) {
    c.font = `400 ${size}px ${FONT}`;
    c.textBaseline = "alphabetic";
  }

  function layoutSlides(width, height) {
    const maxW = width * 0.82;
    layouts = SLIDES.map((slide, si) => {
      const lines = slide.map((row, li) => {
        let size = fontFor(row.role, width, height);
        setFont(ctx, size);
        while (ctx.measureText(row.text).width > maxW && size > 22) {
          size -= 1;
          setFont(ctx, size);
        }
        const gap = size * (row.role === "title" ? 0.38 : 0.32);
        return {
          text: row.text,
          role: row.role,
          size,
          width: ctx.measureText(row.text).width,
          height: size * 1.2,
          gap,
          chars: row.text.length,
          seed: si * 40 + li * 7,
        };
      });
      const blockH =
        lines.reduce((sum, line, i) => sum + line.height + (i < lines.length - 1 ? line.gap : 0), 0);
      let y = (height - blockH) / 2;
      lines.forEach((line) => {
        line.x = (width - line.width) / 2;
        line.y = y + line.size * 0.82;
        y += line.height + line.gap;
      });
      return {
        lines,
        chars: lines.reduce((sum, line) => sum + line.chars, 0),
      };
    });
  }

  function scrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 1;
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  function slideState(progress) {
    const n = SLIDES.length;
    const scaled = progress * n;
    const i = Math.min(n - 1, Math.floor(scaled));
    const local = scaled - i;
    const write = i === n - 1 ? Math.min(1, local / 0.9) : Math.min(1, local / 0.82);
    return { i, write };
  }

  function drawWriting(c, layout, until) {
    const count = Math.ceil(until * layout.chars);
    if (count <= 0) return;
    let left = count;
    c.fillStyle = INK;
    c.strokeStyle = INK_EDGE;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.textAlign = "left";
    c.shadowColor = "transparent";
    c.shadowBlur = 0;

    layout.lines.forEach((line) => {
      if (left <= 0) return;
      const n = Math.min(left, line.chars);
      setFont(c, line.size);
      c.lineWidth = Math.max(2.8, line.size * 0.09);
      let x = line.x;
      for (let i = 0; i < n; i += 1) {
        const ch = line.text[i];
        const w = c.measureText(ch).width;
        if (ch !== " ") {
          const wob = seeded(line.seed + i * 1.7) - 0.5;
          c.save();
          c.translate(x + w / 2, line.y + wob * 1.1);
          c.rotate(wob * 0.025);
          c.strokeText(ch, -w / 2, 0);
          c.fillText(ch, -w / 2, 0);
          c.restore();
        }
        x += w;
      }
      left -= line.chars;
    });
  }

  function paint() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);
    const state = slideState(scrollProgress());
    const layout = layouts[state.i];
    if (!layout) return;
    drawWriting(ctx, layout, state.write);
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
    layoutSlides(width, height);
    paint();
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
