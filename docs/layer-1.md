# Layer 1 — top sheet

Layer 1 is the **first layer we built** and the **top** layer of the stack. Everything added later goes **under** this drawing.

## What it is

A **mango-leaf thoranam** (thoranallu): a festive doorway garland.

- White page underneath
- A slightly hand-wobbled **brown thread** around the border of the viewport
- **Mango leaves** of mixed sizes and greens, watercolor style
- Leaves hang in **pairs** from each knot, tilted left and right
- As you **scroll down**, the thread and leaves paint themselves around the frame
- At the bottom of the page, the thoranam **closes**

The center of the page stays open so later, lower layers can show through.

## Files

| File | Role |
| --- | --- |
| `index.html` | Page copy and the ink canvas |
| `css/style.css` | White page, tall scroll, canvas overlay |
| `js/layer1.js` | Thread path, leaf placement, scroll paint |

The canvas is `position: fixed` and `z-index: 3`, so it stays on the **edges of the viewport** while the text scrolls underneath.

## Look

- Thread: light brown, a little zigzag, not a perfect line
- Leaves: long mango shape, soft watercolor edges, several greens
- Sizes: mixed (small to large)
- Placement: even knots along the rope; two leaves per knot

## Performance note

Leaves are **baked once** into small offscreen sprites (blur, washes, veins). Scroll only blits those images and draws the thread. New lower layers should do the same: paint expensive art once, composite cheaply on scroll.

## Next

Layer 2 is the **next sheet down** — rice and finger writing, behind this thoranam. See [layer-2.md](layer-2.md).