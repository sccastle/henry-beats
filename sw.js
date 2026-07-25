/* JUST HENRY & BEATS · 离线缓存
   ------------------------------------------------------------------
   策略分两类：
     · 页面和谱面（.html / .json）走「网络优先」——联网时永远拿最新的，
       断网才回落到缓存。这样更新 index.html 立刻生效。
     · 音频和图片（.m4a / .png / webmanifest）走「缓存优先」——体积大且
       基本不变，存一次就不再重复下载。
   发新版时把下面的 VER 改掉，旧缓存会在激活时清空。
   ------------------------------------------------------------------ */
const VER   = 'V0.7.2';
const CACHE = 'jhb-' + VER;

const SHELL = [
  'index.html', 'henry_run.png', 'henry_idle.png',
  'icon-h192.png', 'icon-h512.png', 'app.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

function isNetFirst(p) {
  return p.endsWith('/') || p.endsWith('.html') || p.endsWith('.json');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (isNetFirst(url.pathname)) {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
        return res;
      } catch (err) {
        const hit = await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        throw err;
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
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
