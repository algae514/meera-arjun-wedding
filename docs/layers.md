# Layers

We go **from the top layer to lower layers**.

## Rule

- **Layer 1** = first built = **top** of the stack (closest to the viewer).
- **Layer 2** = second built = sits **under** Layer 1.
- **Layer N** = sits under Layer N−1.

Do not cover Layer 1 when adding a new layer. Draw behind it (`z-index` lower than Layer 1’s canvas). Leave the open middle of the page visible so lower work can read.

## Current stack

1. **Layer 1 (top)** — mango-leaf thoranam. See [layer-1.md](layer-1.md).
2. **Layer 2** — invitation text written as you scroll (`js/layer2.js`).
3. **Layer 3** — pre-wedding painting, drawn in with the scroll (`js/photo.js`, `images/prewed-pic1.png`).

## Adding a layer

1. New canvas (or sheet) **under** `#ink-canvas`.
2. Own script, e.g. `js/layer2.js`.
3. Bake expensive drawing; scroll should only reveal or blit.
4. Add a `docs/layer-N.md` and a row in the table in [README.md](README.md).
