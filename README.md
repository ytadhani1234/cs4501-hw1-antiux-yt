# Roll No. 21: Space Mein Dhoom Dhadaka

A static, deliberately anti-UX spacecraft repair game for a Usability Engineering assignment. Help Kris restore Power, Navigation, Communications, and Engine, then launch his ship back to Earth. The mission is intentionally confusing, but it is fully completable.

## Live website

https://ytadhani1234.github.io/cs4501-hw1-antiux-yt/

## Run locally

No installation, build step, account, or internet connection is required.

### Quickest way

Open `index.html` in a modern browser. On macOS, you can double-click it in Finder or run this command from the project folder:

```sh
open index.html
```

### Optional: use a local web server

From the project folder, run:

```sh
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser. Press **Ctrl+C** in the terminal to stop the server. If port 8000 is occupied, use another port, such as `python3 -m http.server 8001`, and open the matching URL.

## How to play

1. Read the opening mission and press **BEGIN REPAIR**. The timer starts then.
2. Visit the four subsystem screens in any order and restore each one.
3. Use **LAUNCH CONTROL** when you think all four systems are ready.
4. Press **LAUNCH TO EARTH** to stop the timer and finish the mission.
5. Press **RETRY MISSION** to clear all progress and play again.

The [assignment documentation](documentation.html) explains the 12 intentional usability violations and contains the complete solution path. It is also linked from the opening and success screens.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | All mission screens and the reusable modal |
| `styles.css` | Responsive space-themed interface |
| `app.js` | Timer, navigation, validation, mission state, and reset behavior |
| `documentation.html` | Clean assignment explanation and solution path |
| `assets/` | Local Earth and character images |
| `assets/ASSET_SOURCES.md` | Image credits and usage notes |

The site uses only HTML, CSS, and vanilla JavaScript. It has no backend, external API calls, or runtime dependencies, and it can be hosted on GitHub Pages.

## Image note

The Earth image is public domain. The reuse terms for the Kris and Kanishk character thumbnails could not be confirmed; see [asset sources](assets/ASSET_SOURCES.md) and replace those images with licensed copies before public redistribution.
