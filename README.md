# The Midnight Roast

A single-page coffee-shop frontend built with HTML, CSS and plain JavaScript. Vite runs the development server and builds the production files. There is no backend, ordering system or payment flow.

## Run it locally

Use Node.js 20.19+ or 22.12+ (required by the current Vite version).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Use the development server rather than double-clicking `index.html`, because the page uses a JavaScript module.

```sh
npm run build    # Create the production site in dist/
npm run preview  # Preview that build locally
```

## Read the code in this order

1. **`index.html`**: page content, in display order: navigation, hero, story, six-drink menu, gallery and location/footer. Edit drink names, descriptions and prices here.
2. **`src/style.css`**: appearance. The `:root` block holds colors, fonts, spacing and transition values. Named sections below it style the matching HTML sections. The final media query controls the mobile navigation at widths of 768px or less.
3. **`src/main.js`**: page interactions. `initializePage()` connects four small setup functions:
   - `initializeMobileMenu()`: opens the mobile navigation and closes it when a navigation link is chosen.
   - `initializeNavbarScroll()`: switches the navbar style after scrolling 50px.
   - `initializeAnchorScrolling()`: scrolls section links smoothly, with a 70px navbar offset.
   - `initializeScrollReveals()`: reveals story, menu and gallery once as they enter the viewport.
4. **`package.json`**: run/build commands and dependencies. `package-lock.json` records the installed versions; avoid editing it by hand.

The stylesheet is linked from HTML. The module script at the end of HTML loads `src/main.js`, so interactions have one source of truth instead of a separate inline copy.

## Check a change

- Run `npm run build`.
- At desktop and mobile widths, check the hero, story, six menu items, gallery and footer.
- On mobile, open/close the menu and choose each navigation link.
- Check that section links scroll, the navbar shrinks after scrolling, and revealed sections stay visible when you return to them.
- Check the browser console. This repository does not yet include an automated test suite.

Keep unrelated changes on a separate branch. Make a small pull request, explain what changed and ask the other person to review before merging.

## Existing limitations, unchanged by this cleanup

- Photos and fonts load from external services; the map is a Google Maps iframe. Network blocks can affect those resources.
- Social links are placeholders (`href="#"`). Their existing click handler passes `#` to `querySelector`, which raises an invalid-selector error. Replacing those links or changing their behavior is separate from this readability pass.
- The favicon points to `/vite.svg`, but that asset is not tracked.
- The root `The-Midnight-Roast` entry is a Git submodule pointer with no `.gitmodules` configuration. It is not part of the running page and is left untouched. Do not run recursive submodule setup for this project.
- Dependency audit findings need a separate update and regression check. This cleanup does not change dependency versions or the lockfile.
