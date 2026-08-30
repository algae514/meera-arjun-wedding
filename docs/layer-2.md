# Layer 2 — under the thoranam

Layer 2 is the **second sheet**. It sits **under** Layer 1. The mango-leaf border stays in front; this drawing shows through the open middle and the gaps in the leaves.

## What it is

Rice, thrown first. Then a word written through the grains with a finger.

- **Rice is already on the page** — handfuls scattered over the viewport, plus stray grains. This does not wait for scroll.
- As you **scroll down**, a finger writes **shubham** through the rice: a soft furrow, grains pushed aside along the stroke.
- The letters sit in the open middle of the viewport, under the thoranam.

The word is a stand-in. Change `WORD` in `js/layer2.js` when the real writing is chosen. New letters need a matching glyph path in that file.

## Files

| File | Role |
| --- | --- |
| `index.html` | `#rice-canvas` under `#ink-canvas` |
| `css/style.css` | Writing canvas `z-index: 2` (photo is `1`, Layer 1 is `3`) |
| `js/layer2.js` | Grain sprites, throw, finger path, scroll write |

The rice canvas is `position: fixed`, same viewport lock as Layer 1, but behind it.

## Look

- Grains: short rice kernels, mixed cream and warm ivory, slight shine and husk specks
- Throw: several handfuls (clumps) plus a thinner scatter
- Writing: thick, wobbled finger stroke; rice nearest the path is shoved off the line as that part of the word is reached

## Performance note

Grain art is baked into a few offscreen sprites. Scroll only blits grains and strokes the furrow up to the current progress.

## Next

Layer 3 is the pre-wedding painting under this writing.
