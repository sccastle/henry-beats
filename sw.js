/* JUST HENRY & BEATS · 离线缓存
   改动 VER 就会触发浏览器更新这个 Worker，页面上会弹出更新提示。 */
const VER   = 'V0.7.0';
const CACHE = 'jhb-' + VER;

/* 开机就该有的东西，装 Worker 时一次性存好 */
const SHELL = [
  'index.html', 'henry_run.png', 'henry_idle.png',
  'icon-192.png', 'icon-512.png', 'app.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    /* 单个失败不能拖垮整体安装 */
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* 页面点「立即更新」时会发这条消息 */
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* manifest.json 永远走网络：版本检测全靠它是最新的 */
  if (url.pathname.endsWith('manifest.json')) {
    e.respondWith(
      fetch(req).catch(() => caches.match(req, { ignoreSearch: true }))
    );
    return;
  }

  /* 其余一律缓存优先。歌曲第一次播放时被顺手存下，之后再也不用联网 */
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
