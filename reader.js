import { getDocument, GlobalWorkerOptions, TextLayer } from './assets/pdfjs/pdf.mjs';
GlobalWorkerOptions.workerSrc = new URL('./assets/pdfjs/pdf.worker.mjs', import.meta.url).href;
const books = {
  fantasia: { title: 'Fantasia', file: 'fantasia.pdf', lang: 'en' },
  'fantasia-el': { title: 'Φαντασία', file: 'fantasia-el.pdf', lang: 'el' },
  'fantasia-ii': { title: 'Fantasia II', file: 'fantasia-ii.pdf', lang: 'en', start: 2 },
};
const book = books[new URLSearchParams(location.search).get('book')] || books.fantasia;
const $ = id => document.getElementById(id);
const status = $('reader-status');
const file = new URL(`assets/books/${book.file}`, location.href).href;
$('book-title').textContent = book.title;
document.title = `${book.title} — Reading room`;
$('download').href = file;
$('text-layer').lang = book.lang;
let pdf, current = Number(location.hash.match(/^#page=(\d+)$/)?.[1]) || book.start || 1;
let rendering = false, requested = false;
async function render() {
  requested = true;
  if (rendering || !pdf) return;
  rendering = true;
  try {
    while (requested) {
      requested = false;
      current = Math.max(1, Math.min(pdf.numPages, current));
      const pageNumber = current;
      status.textContent = `Loading page ${pageNumber}…`;
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const available = Math.max(240, document.documentElement.clientWidth - (innerWidth < 600 ? 20 : 40));
      const scale = $('zoom').value === 'fit' ? Math.min(available, 900) / base.width : Number($('zoom').value);
      const viewport = page.getViewport({ scale });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = $('canvas');
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      $('paper').style.setProperty('--scale-factor', scale);
      await page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[ratio,0,0,ratio,0,0]}).promise;
      const layer = $('text-layer');
      layer.replaceChildren();
      await new TextLayer({ textContentSource: await page.getTextContent(), container: layer, viewport }).render();
      $('page').value = pageNumber;
      $('previous').disabled = pageNumber === 1;
      $('next').disabled = pageNumber === pdf.numPages;
      history.replaceState(null, '', `#page=${pageNumber}`);
      status.textContent = `Page ${pageNumber} of ${pdf.numPages}`;
    }
  } catch (error) {
    console.error('Reader error', error);
    status.textContent = 'This page could not be displayed. Try another page, or use Download PDF above.';
  } finally { rendering = false; }
}
$('previous').onclick = () => { current--; render(); };
$('next').onclick = () => { current++; render(); };
$('page').onchange = () => { current = Number($('page').value) || 1; render(); };
$('zoom').onchange = render;
let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render, 150); });
document.addEventListener('keydown', event => {
  if (['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName) || !pdf) return;
  if (event.key === 'ArrowRight' && current < pdf.numPages) { current++; render(); }
  if (event.key === 'ArrowLeft' && current > 1) { current--; render(); }
});
try {
  pdf = await getDocument({ url:file, cMapUrl:'assets/pdfjs/cmaps/', cMapPacked:true, standardFontDataUrl:'assets/pdfjs/standard_fonts/', wasmUrl:'assets/pdfjs/wasm/' }).promise;
  $('page').max = pdf.numPages;
  $('page').disabled = false;
  $('page-count').textContent = `of ${pdf.numPages}`;
  await render();
} catch (error) {
  console.error('Book load failed', error);
  status.textContent = 'The book could not be opened. Please try again, or use Download PDF above.';
}
