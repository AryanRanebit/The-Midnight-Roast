
# The Midnight Roast

An interactive, slightly sarcastic website for The Midnight Roast, an artisanal coffee shop in Badlapur, Maharashtra.
Built with Vite and vanilla JavaScript. No framework.

## Run it

Requires Node.js 18 or newer.

```bash
npm install      # first time only
npm run dev      # start dev server (usually http://localhost:5173)
npm run build    # production build into /dist
npm run preview  # serve the production build locally
```

Don't open `index.html` directly. Use the dev server or a built `dist`.

## Features

- **Bean cursor** with a trail of small beans. Clicks scatter beans. Touch devices get tap bursts instead.
- **Hero bean pile**: real physics (gravity, collisions). The cursor shoves beans and clicks send up bursts.
- **Scroll-driven roast**: one bean goes from green to dark as you scroll and cracks at the midpoint. The story copy follows the stages.
- **Interactive menu**: hover or tap a drink to see it drawn in an animated glass. A "Roll the beans" button picks a random drink.
- **Tab**: add drinks, adjust quantities, see the total in rs, copy the order. It is only an estimate, not a checkout. The tab is saved in `localStorage`.
- **Latte art cup**: pour milk, etch with a toothpick, or watch "Show off" pour a rosetta.
- **Visit section**: live open or closed status (India time), directions link, copy-address button, map embed.
- Smooth scrolling (Lenis), parallax title, scrolling marquee, word-by-word heading reveals.
- Responsive, keyboard accessible, and respects `prefers-reduced-motion`.

## Project structure

```
index.html        Page markup
src/
  main.js         Entry: smooth scroll, nav, reveals, marquee, footer buttons
  style.css       All styles and design tokens
  beans.js        Bean sprite drawing and shared helpers
  fx.js           Custom cursor, trail, click bursts
  hero.js         Hero bean physics
  roast.js        Scroll-driven roast section
  menu.js         Menu data, glass illustrations, tab, randomizer
  latte.js        Latte art canvas
```

## Editing content

- **Menu items, prices, descriptions:** edit the `MENU` array at the top of `src/menu.js`. Each entry has a name, price (rs), description, a one-liner (`quip`) and the options that control how its glass is drawn.
- **Social links:** the `SOCIALS` object at the top of `src/main.js` is empty. Add real URLs and the footer buttons will open them. Until then they show a "still brewing" message.
- **Address and hours:** edit the footer in `index.html`. The open/closed status logic is `status()` in `src/main.js` (currently 7:00 AM to 6:00 PM IST).
- **Colors:** change the CSS variables at the top of `src/style.css` (`--espresso`, `--cream`, `--ember` and so on).
- **Copy:** all headings and jokes live in `index.html` and `src/menu.js`.

## Notes

- The map is a Google Maps embed and needs an internet connection.
- Fonts (Fraunces, Instrument Sans, JetBrains Mono) are installed from npm via Fontsource, so nothing loads from Google Fonts.

&copy; 2026 The Midnight Roast. All rights reserved.
