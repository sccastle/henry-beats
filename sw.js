/* JUST HENRY & BEATS · 离线缓存
   ------------------------------------------------------------------
   两个缓存分开管：
     · SHELL（带版本号）：页面和脚本，版本一变就整批换新
     · MEDIA（不带版本号）：音频和谱面，一次缓存长期有效，
       更新版本不会清掉，不用重新下载十几 MB
   页面/谱面走网络优先（联网即最新），音频走缓存优先。
   ------------------------------------------------------------------ */
const VER   = 'V0.12.2';
const SHELL_CACHE = 'jhb-shell-' + VER;
const MEDIA_CACHE = 'jhb-media';          /* 永不随版本删除 */

const SHELL = [
  'index.html', 'ocean.html', 'paint.html', 'jump.html',
  'henry_run.png', 'henry_idle.png',
  'icon-h192.png', 'icon-h512.png', 'app.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL_CACHE);
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => {
      if (k === MEDIA_CACHE) return null;               /* 媒体缓存保留 */
      if (k === SHELL_CACHE) return null;
      return caches.delete(k);                          /* 只清旧版 shell */
    }));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

const isMedia = p => p.endsWith('.m4a') || p.endsWith('.ogg') || p.endsWith('.mp3');
const isNetFirst = p =>
  p.endsWith('/') || p.endsWith('.html') || p.endsWith('manifest.json') || p.endsWith('jumpcharts.json');

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const p = url.pathname;

  /* 音频：缓存优先，存进永久缓存 */
  if (isMedia(p)) {
    e.respondWith((async () => {
      const c = await caches.open(MEDIA_CACHE);
      const hit = await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok && res.status === 200) c.put(req, res.clone());
      return res;
    })());
    return;
  }

  /* 页面和清单：网络优先，断网回落 */
  if (isNetFirst(p)) {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) { const c = await caches.open(SHELL_CACHE); c.put(req, res.clone()); }
        return res;
      } catch (err) {
        const hit = await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        throw err;
      }
    })());
    return;
  }

  /* 曲目谱面 json、图片等：缓存优先，存进永久缓存 */
  e.respondWith((async () => {
    const c = await caches.open(MEDIA_CACHE);
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok && res.status === 200) c.put(req, res.clone());
      return res;
    } catch (err) {
      const any = await caches.match(req, { ignoreSearch: true });
      if (any) return any;
      throw err;
    }
  })());
});
