# ITOps Solution — logo SVGs & intro preloader

## Files (`frontend/public/`)

| File | What it is |
| --- | --- |
| `itops-loader.svg` | Animated intro, for light backgrounds. |
| `itops-loader-dark.svg` | Same animation for dark backgrounds. Only the navy ink changes ("ps", "O", "Solution", tagline text), using the colours in `itops-logo-full-dark.png`. |
| `itops-logo-static.svg` | Final frame, no animation, for light backgrounds. |
| `itops-logo-static-dark.svg` | Final frame for dark backgrounds. |

- **Format:** pure SVG with CSS `@keyframes` in an internal `<style>`. No JS, SMIL, fonts or embedded images.
- **Size:** each file is under 50 KB and uses `viewBox="118 157 1578 512"` only, so it scales to any width.
- **Background:** transparent. The logo is centred with an equal 14-unit margin on every side.

## Element map

Every group has an id, so you can restyle or retime it.

| Id | Element |
| --- | --- |
| `#servers` > `#server-left`, `#server-center`, `#server-right` | The 3 racks: side face, front frame, recessed panel, slot bars and top rim. The centre rack is the tallest. |
| `#server-lights` > `#server-{left,center,right}-lights` > `.row` | Indicator lights, 3 per lit slot: left 4 rows, centre 4, right 5. |
| `#cloud` > `#cloud-fill` (+ `#cloud-sheen`), `#cloud-stroke` | Ribbon silhouette with its cyan → blue → magenta colour, and the outline used for the draw-on. |
| `#shield` > `#shield-glow`, `#shield-back`, `#shield-rim`, `#shield-face`, `#lock` | Shield layers. `#lock` contains `#lock-shackle` and `#lock-body` (the keyhole is cut through the body). |
| `#wordmark` > `#wordmark-itops`, `#wordmark-solution` (+ `#solution-i-dot`) | Wordmark. "ITOps" is revealed by the `#c-wipe` clip. |
| `#tagline` > `#tagline-lines`, `#tagline-dividers`, `#tagline-secure`, `#tagline-monitor`, `#tagline-automate`, `#tagline-scale` | Side lines, dividers, and each icon with its word. |

## Timeline

Times assume `--itops-speed: 1`.

| Time (s) | What happens |
| --- | --- |
| 0.10–0.91 | The racks rise from their base, one after another: left, centre, right. |
| 0.62–1.33 | Lights switch on row by row, each rack's lights starting once that rack is in place. |
| 0.95–1.75 | The ribbon outline draws on. |
| 1.50–1.95 | The gradient fill fades in, then the outline fades out. |
| 1.85–2.35 | The shield drops into place with a small overshoot and no bounce. |
| 2.20–2.63 | The lock body appears, then the shackle closes last. |
| 2.30–2.85 | "ITOps" is wiped in from left to right. |
| 2.68–3.08 | "Solution" fades in. |
| 2.90–3.60 | The side lines extend outward, then SECURE, MONITOR, AUTOMATE and SCALE fade in one after another. |

The preloader then holds the finished logo for 0.5 s and fades out.

Every element animates in its final position, using only `transform`, `opacity` and `stroke-dashoffset`. The ITOps wipe is a clip whose rect animates `transform: scaleX`.

- **Change the speed:** set `--itops-speed` on the `<svg>` element. `1.5` is slower and `0.8` is faster. The variable only works when the SVG is inline; for `<img>` or CSS backgrounds, edit the default in the file's `.itops{--itops-speed:1}` rule.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, all animations are removed and the final logo shows immediately.

## How it's wired into this React (Vite) app

The preloader lives in `frontend/index.html`, not in React, so it paints before the JS bundle downloads:

- **Styles:** a `<style>` block in `<head>`.
- **Markup:** `<div id="itops-preloader"><img></div>`, the first thing in `<body>`.
- **Script:** an inline script of about 10 lines that does three things:
  - It picks `itops-loader-dark.svg` or `itops-loader.svg` from ThemeContext's `localStorage["itops-theme"]` (default dark) and matches the overlay background (`#0b0f19` or `#f6f7fb`).
  - It hides the overlay only when **both** of these have happened: the page's `load` event has fired, and 4.1 s have passed since the SVG loaded (3.6 s intro + 0.5 s hold). It then fades out over 0.6 s and removes the node.
  - It plays on every full page load or refresh. Client-side route changes never show it, because the SPA never reloads `index.html`.
  - It keeps the `<img>` hidden until the SVG has loaded, so no empty image box flashes first.
- **CSS-only fallback:** `animation: itops-preloader-out .6s ease 6s forwards` fades the overlay after 6 s no matter what (JS error, blocked script, slow network). It can never block the site.

In-app loading states (route guards and lazy routes) use `BrandLoading` in `src/components/BrandLogo.jsx`. It shows the static vector logo (`src/assets/itops-logo-static*.svg`) with a soft pulse, because those states are often too short for the full intro to finish.

### Plain HTML / WordPress

- **Plain HTML:** copy the `<style>` block, the `#itops-preloader` div and the inline `<script>` from `index.html` into your page. Put the SVGs next to it and adjust the `/itops-loader*.svg` paths.
- **WordPress:**
  1. Upload the SVGs to your theme (for example `wp-content/themes/<theme>/assets/`).
  2. Put the `<style>` in the `wp_head` hook.
  3. Put the div and the script in `wp_body_open`, right after `<body>`.
  4. Point `img.src` at the theme URL.
  5. Replace `localStorage.getItem("itops-theme")` with whatever your theme uses, or hard-code one variant.
  6. Exclude the inline script from JS minify/defer plugins, otherwise the overlay waits for the 6 s CSS fallback.

## Usage examples

**`<img>`** (the animation plays each time the image loads):

```html
<img src="/itops-loader.svg" alt="ITOps Solution" width="789" height="256" />
<img src="/itops-logo-static.svg" alt="ITOps Solution" style="width:100%;height:auto" />
```

**CSS background:**

```css
.hero-logo {
  aspect-ratio: 1578 / 512;
  background: url("/itops-logo-static.svg") center / contain no-repeat;
}
```

**Inline SVG** (the only mode where `--itops-speed` and per-element CSS overrides work):

```jsx
// React (Vite): import the markup as a string
import loaderSvg from "../assets/itops-loader.svg?raw";

<div style={{ "--itops-speed": 1.25 }} dangerouslySetInnerHTML={{ __html: loaderSvg }} />
```

```html
<!-- plain HTML: paste the file's <svg>…</svg> markup, then e.g. -->
<style>.itops { --itops-speed: 1.25 } .itops #tagline { display: none }</style>
```

All internal CSS is scoped under the root `.itops` class, so inlining it won't restyle the rest of the page. Don't inline two of these SVGs on the same page, because their gradient and clip ids would collide. Use `<img>` for the second one.

## Fidelity notes

Source: `chatgpt logo for itops 2 .png` (1774×887 raster). This is how each part was vectorised:

- **Traced from the pixels:** the wordmark letters (including the pin-shaped counter in "O" and the flag on the T), the i-dot, the ribbon silhouette, the padlock and keyhole, and the 4 tagline icons.
- **Built from measurements:** the shield (symmetric curves fitted to the rim, face and back-plate edges within about 2 px), and the racks, whose sizes, slopes, 13 slot rows and 39 light positions were measured from brightness profiles.
- **Matched to a font:** the tagline text is set in Montserrat Medium (OFL), converted to outlines. Montserrat is the font used in the image; each letter is placed at its measured position.
- **Colour:** sampled from the logo. The ribbon's glossy shading is reproduced by 24 radial-gradient layers fitted to the source by least squares.

Known limits: the source's glossy 3D shading (specular streaks on the ribbon, bevel reflections on the racks and shield) can only be approximated with SVG gradients. The shapes, positions and palette match the logo, but the rendering is a little softer than the raster. The source was generated as a raster, so there is no original vector master to copy. If a pixel-exact match matters, have a designer produce the master artwork (AI/SVG/PDF). The same group ids and animation CSS can then be applied to it unchanged.
