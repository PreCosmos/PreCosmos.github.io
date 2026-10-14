# Stavros Aeneas Kokkineas — personal website

A responsive, static author website for https://precosmos.github.io, with self-hosted English and Greek book PDFs. No build tools, secrets, or runtime dependencies are required. The stylized covers are website artwork, not reproductions of the original PDF covers.

## Preview

From this directory, run `python -m http.server 8000`. Open the local server in a browser. The homepage works without JavaScript. The on-page reader uses self-hosted PDF.js 6.4.299 (Apache-2.0; license in `assets/pdfjs/LICENSE`), with page controls, zoom, selectable text, and PDF downloads. Without JavaScript it offers direct PDF links. Google Fonts is optional; system fonts provide fallbacks.

## Publish

Create the GitHub repository `PreCosmos/PreCosmos.github.io`, push these files to its `main` branch, then select **Settings → Pages → Build and deployment → Source → GitHub Actions**. The included workflow deploys on pushes to main; run it manually if needed after enabling Pages. The expected public URL is https://precosmos.github.io/ after a successful deployment.

## Edit

Page text and reading links are in `index.html`; design and responsive layouts are in `style.css`. PDFs live in `assets/books/`. The author name and collection contents were verified against the source books. Browser validation passed at 390, 768, and 1440px. All three editions rendered with selectable text; next/previous, page entry, zoom, and downloads passed without JavaScript errors. Screenshots are saved alongside the project in `/workspace/site-review/`.

The About Me section uses the author-supplied outdoor portrait in `assets/author.jpg`. Its responsive crop is controlled by `.author-photo` in `style.css`.
