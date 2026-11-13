/* A static server for the fixture decks, on Node's standard library alone.

   The fixtures need a real http origin, not file://, because the runtime keeps
   the whole review in localStorage and a file:// page has an opaque origin that
   cannot write to it.

   `/deck-comments.js` is served straight out of ../assets and `/default/*` out
   of ../slides, so the suite always
   drives the shipped asset and never a copy of it that can drift. The layout
   spec needs that: it measures the shipped canvas through the default example
   deck (`/default/example.html`, which links the real slides/deck.css), because
   a fixture carrying its own copy of the slide canvas would go on passing after
   the canvas changed. `/default/` is a prefix route on purpose: a route matching
   a `/deck.css` ending would shadow fixtures/deck.css, which the fixtures load. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const FIXTURES = join(HERE, 'fixtures');
const ASSET = join(HERE, '..', 'assets', 'deck-comments.js');
const SLIDES = join(HERE, '..', 'slides');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
                '.json': 'application/json', '.svg': 'image/svg+xml' };

export const PORT = Number(process.env.DECK_TEST_PORT || 4319);

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0]));
  const safe = (base, rel) => join(base, rel.replace(/^(\.\.[/\\])+/, ''));
  let file;
  if (path.endsWith('/deck-comments.js')) file = ASSET;
  else if (path.startsWith('/default/')) file = safe(SLIDES, path.slice('/default'.length));
  else if (path.endsWith('/deck-stage.js')) file = join(SLIDES, 'deck-stage.js');
  else if (path.endsWith('/deck-tools.js')) file = join(SLIDES, 'deck-tools.js');
  else file = safe(FIXTURES, path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream',
                         'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
}).listen(PORT, () => console.log(`fixtures on http://127.0.0.1:${PORT}`));
