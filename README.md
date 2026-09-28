# Hotel Antiusabilius

A static, intentionally frustrating hotel-booking simulation for CS4501 Usability Engineering. The booking can be completed, and [the instructor documentation](./documentation.html) explains all 16 deliberate usability violations.

The site uses only HTML, CSS, and vanilla JavaScript. It has no build step, backend, database, external API, real reservations, or payment form. Guest information is explicitly fake and remains in the current browser tab's `sessionStorage`.

## View locally

Open `index.html` in a browser. For a local HTTP preview, run a static file server from this repository's root, such as `python3 -m http.server 8000`, and open `http://localhost:8000/`.

## Publish with GitHub Pages

1. Commit and push the site files to the `main` branch of this repository.
2. In the GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, then choose **main** and **/(root)**.
4. Open the Pages URL shown in Settings after publication. Keep the repository's `index.html` at the root of that publishing source.

All site links and asset paths are relative, so the pages also work at a GitHub Pages project URL such as `https://ytadhani1234.github.io/cs4501-hw1-antiux-yt/`.

## Completion path

The assigned stay is Charlottesville, November 14–15, 2026, for two adults. Room B is the cheapest after its fee and base-rate tax. Apply Room B, remember `B-417-K`, leave all extras off, enter fake guest information, and enter the code on the review page. The public documentation contains a full cheatsheet for grading.
