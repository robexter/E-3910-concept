const CACHE_NAME = 'e3910-concept-v3-1-atalho-visual';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './retirada-e3910-manutencao.html?v=3',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

const SHORTCUT_MARKER = '<section class="panel" id="panel">';
const SHORTCUT_ID = 'e3910-training-shortcut-v3';

const SHORTCUT_HTML = `
  <!-- INÍCIO: Atalho automático Retirada E-3910 V3 -->
  <div id="${SHORTCUT_ID}" class="section-title" style="margin-top:4px">
    <h2>Manobras operacionais</h2>
    <p>Treinamento de retirada para manutenção com visão CIC.</p>
  </div>

  <section class="card" style="padding:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;border-color:#6d5630;background:linear-gradient(180deg,#241f14,#0d171f)">
    <div>
      <div style="font-size:11px;font-weight:900;letter-spacing:.08em;color:#ffd28a;margin-bottom:5px">🛠️ V3 • REFINAMENTO CIC • E-3910</div>
      <b style="font-size:18px">Retirada de Operação da E-3910 para Manutenção</b>
      <p style="margin:6px 0 0;color:#9fb2c5;line-height:1.45">7 macrofases • decisão + confirmação • tendências • 21 etapas preservadas • avaliação CIC às cegas.</p>
    </div>
    <a class="ui primary" href="./retirada-e3910-manutencao.html?v=3" style="text-decoration:none;white-space:nowrap">🛠️ Treinar manobra</a>
  </section>
  <!-- FIM: Atalho automático Retirada E-3910 V3 -->
`;

function injectTrainingShortcut(html) {
  if (!html || html.includes(`id="${SHORTCUT_ID}"`)) return html;
  if (!html.includes(SHORTCUT_MARKER)) return html;
  return html.replace(SHORTCUT_MARKER, `${SHORTCUT_HTML}\n  ${SHORTCUT_MARKER}`);
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isMainPage =
    url.origin === self.location.origin &&
    (
      url.pathname.endsWith('/E-3910-concept/') ||
      url.pathname.endsWith('/E-3910-concept/index.html')
    );

  if (isMainPage) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(async response => {
          if (!response || !response.ok) return response;

          const html = await response.text();
          const modified = injectTrainingShortcut(html);

          const headers = new Headers(response.headers);
          headers.set('Content-Type', 'text/html; charset=utf-8');

          const injectedResponse = new Response(modified, {
            status: response.status,
            statusText: response.statusText,
            headers
          });

          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, injectedResponse.clone())
          );

          return injectedResponse;
        })
        .catch(() =>
          caches.match(event.request).then(async cached => {
            if (!cached) return caches.match('./index.html');

            const html = await cached.text();
            return new Response(injectTrainingShortcut(html), {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          })
        )
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached => cached || caches.match('./index.html'))
      )
  );
});
