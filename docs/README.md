# Layered static website

A long, scroll-driven static page. Art is built as **stacked layers**, one at a time.

The page is a white sheet. Each layer is a drawing that sits on that sheet (or under the layers above it). Scrolling **paints** the current work — the line and shapes appear as you move down, as if they are being drawn.

We add layers **from the top down**:

1. Build the **top** layer first (what sits in front).
2. Then add layers **under** it (background, atmosphere, other drawings).

Later layers should not replace Layer 1. They sit beneath it and show through where Layer 1 is empty (the open middle of the page and gaps in the leaves).

## Layer stack

| Order we build | Role | z-order | Status |
| --- | --- | --- | --- |
| **Layer 1** | Top drawing — mango-leaf thoranam around the page border | Front (highest) | Done |
| **Layer 2** | Invitation text written as you scroll | Under Layer 1 | Done |
| **Layer 3** | Pre-wedding painting, drawn as you scroll | Under the text | Done |

Think of it as looking down onto a stack of transparent sheets. Layer 1 is the top sheet. The next sheet we add is **under** that one.

```
  viewer
     |
     v
  +-----------------+
  |  Layer 1 (top)  |  thoranam — painted as you scroll
  +-----------------+
  |  Layer 2        |  invitation writing
  +-----------------+
  |  Layer 3        |  pre-wedding painting
  +-----------------+
  |  White page     |  base
  +-----------------+
```

## How to view

Open `index.html` in a browser, or serve the project folder and scroll. Layer 1 is `#ink-canvas` (`js/layer1.js`). Writing is `#rice-canvas` (`js/layer2.js`). The painting is `#photo-canvas` (`js/photo.js`).

## Docs

- [Layers](layers.md) — how the stack works and how to add the next sheet
- [Layer 1](layer-1.md) — the top layer
- [Layer 2](layer-2.md) — invitation writing
