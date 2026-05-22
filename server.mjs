#!/usr/bin/env node
/**
 * Mockup Server
 * ==============
 * Interactive UI mockup server with live reload and event tracking.
 *
 * Usage:
 *   node .claude/skills/mockup/server.mjs
 *
 * Env:
 *   MOCKUP_HOST=0.0.0.0        (bind address, default 127.0.0.1)
 *   MOCKUP_URL_HOST=localhost   (public-facing hostname, default localhost)
 *   MOCKUP_PORT=0               (port, default 0 = random)
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// ========== Paths ==========
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DESIGN_SYSTEM_CSS_PATH = path.join(__dirname, 'design-system', 'base.css');
const TRACKER_SOURCE_PATH = path.join(__dirname, 'mockup-tracker.js');

// ========== WebSocket helpers ==========
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
function acceptKey(k) { return crypto.createHash('sha1').update(k + WS_MAGIC).digest('base64'); }
function encodeFrame(opcode, payload) {
  let h;
  if (payload.length < 126) { h = Buffer.alloc(2); h[0] = 0x80 | opcode; h[1] = payload.length; }
  else { h = Buffer.alloc(4); h[0] = 0x80 | opcode; h[1] = 126; h.writeUInt16BE(payload.length, 2); }
  return Buffer.concat([h, payload]);
}
function decodeFrame(buf) {
  if (buf.length < 2) return null;
  const masked = !!(buf[1] & 0x80);
  let len = buf[1] & 0x7F, off = 2;
  if (len === 126) { if (buf.length < 4) return null; len = buf.readUInt16BE(2); off = 4; }
  if (!masked) return null;
  const maskOff = off, dataOff = off + 4, total = dataOff + len;
  if (buf.length < total) return null;
  const mask = buf.slice(maskOff, dataOff);
  const data = Buffer.alloc(len);
  for (let i = 0; i < len; i++) data[i] = buf[dataOff + i] ^ mask[i % 4];
  return { opcode: buf[0] & 0x0F, payload: data, bytesConsumed: total };
}

// ========== Config ==========
const HOST = process.env.MOCKUP_HOST || '127.0.0.1';
const URL_HOST = process.env.MOCKUP_URL_HOST || 'localhost';
const PORT = parseInt(process.env.MOCKUP_PORT, 10) || 0;

const SESSION_ID = `${process.pid}-${Date.now()}`;
const BASE_DIR = `/tmp/mockup-${SESSION_ID}`;
const CONTENT_DIR = `${BASE_DIR}/content`;
const STATE_DIR = `${BASE_DIR}/state`;

// ========== Tracker JavaScript ==========
const TRACKER_JS = `(function(){
var ws=null,queue=[],host=window.location.host;
function connect(){
  ws=new WebSocket('ws://'+host);
  ws.onopen=function(){
    var s=document.getElementById('conn-status');if(s)s.textContent='connected';
    queue.forEach(function(e){ws.send(JSON.stringify(e))});queue=[];
  };
  ws.onmessage=function(m){var d=JSON.parse(m.data);if(d.type==='reload')window.location.reload()};
  ws.onclose=function(){var s=document.getElementById('conn-status');if(s)s.textContent='disconnected, reconnecting...';setTimeout(connect,1000)};
}
connect();

function sendEvent(evt){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(evt));else queue.push(evt)}

function formValues(container){
  var o={};container.querySelectorAll('input,select,textarea').forEach(function(el){
    if(el.type==='checkbox'){if(el.checked)o[el.name||el.id]=el.value}else if(el.type==='radio'){if(el.checked)o[el.name||el.id]=el.value}else{o[el.name||el.id||el.placeholder]=el.value}
  });return o;
}
function indicator(t){var b=document.getElementById('indicator-bar');if(b)b.innerHTML=t+' — return to terminal'}

// Click & select tracking
window.toggleSelect=function(el){
  var c=el.closest('.options')||el.closest('.cards');if(c&&!c.dataset.multiselect)c.querySelectorAll('.selected').forEach(function(o){o.classList.remove('selected')});el.classList.add('selected')
};
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-choice],.option,.card,.choice-btn,.swipe-card');
  if(!t)return;
  var choice=t.dataset.choice||(t.querySelector('h3')?t.querySelector('h3').textContent.trim():'')||t.textContent.trim();
  var msg={type:'click',choice:choice,text:t.textContent.trim()};
  var f=t.closest('form')||t.closest('[data-capture]');if(f)msg.inputs=formValues(f);
  sendEvent(msg);
  var c2=t.closest('.options')||t.closest('.cards')||t.closest('.choices');
  if(c2&&!c2.dataset.multiselect)c2.querySelectorAll('.selected').forEach(function(o){o.classList.remove('selected')});
  t.classList.add('selected');
  indicator('<strong>'+(t.querySelector('h3')?t.querySelector('h3').textContent.trim():choice)+'</strong> selected');
  e.stopPropagation();
});

// Form submission
document.addEventListener('submit',function(e){
  e.preventDefault();
  var f=e.target;sendEvent({type:'submit',action:f.getAttribute('action')||'submit',inputs:formValues(f)});
  indicator('Form submitted');
});

// Input changes
document.addEventListener('change',function(e){
  var el=e.target;if(!el.matches('input,select,textarea'))return;
  sendEvent({type:'change',name:el.name||el.id||el.placeholder||'unknown',value:el.value});
});

// Swipe (Tinder-like)
(function(){
var sd=null;
document.addEventListener('pointerdown',function(e){
  var c=e.target.closest('.swipe-card');if(!c||c.classList.contains('removing'))return;
  var s=c.closest('.swipe-stack');if(s&&c!==s.querySelector('.swipe-card:not(.removing)'))return;
  sd={el:c,sx:e.clientX,sy:e.clientY,x:0,y:0};c.style.transition='none';c.setPointerCapture(e.pointerId);
});
document.addEventListener('pointermove',function(e){
  if(!sd)return;sd.x=e.clientX-sd.sx;sd.y=e.clientY-sd.sy;
  sd.el.style.transform='translate('+sd.x+'px,'+sd.y+'px) rotate('+(sd.x*0.1)+'deg)';sd.el.style.opacity=Math.max(0,1-Math.abs(sd.x)/400);
});
document.addEventListener('pointerup',function(e){
  if(!sd)return;var dx=sd.x,dy=sd.y,card=sd.el;sd=null;
  if(Math.abs(dx)>80){
    var dir=dx>0?'right':'left',txt=(card.querySelector('h3')?card.querySelector('h3').textContent.trim():card.textContent.trim());
    card.style.transition='transform 0.4s,opacity 0.4s';card.style.transform='translate('+(dx>0?1000:-1000)+'px,'+dy+'px) rotate('+(dx*0.1)+'deg)';card.style.opacity='0';card.classList.add('removing');
    sendEvent({type:'swipe',direction:dir,choice:txt,text:txt});indicator('<strong>'+txt+'</strong> swiped '+dir);
    setTimeout(function(){card.style.display='none'},400);
  }else{card.style.transition='transform 0.3s,opacity 0.3s';card.style.transform='';card.style.opacity='1'}
})();
})()`;

// ========== Google Fonts helper ==========
const GOOGLE_FONTS_RE = /<!--\s*fonts:\s*(.+?)\s*-->/;
const GOOGLE_FONTS_BASE = 'https://fonts.googleapis.com/css2?';

function extractFontLinks(html) {
  const match = html.match(GOOGLE_FONTS_RE);
  if (!match) return '';
  const fonts = match[1].split(',').map(f => f.trim()).filter(Boolean);
  const families = fonts.map(f => {
    const encoded = f.replace(/\s+/g, '+');
    return `family=${encoded}:wght@300;400;500;600;700;800`;
  }).join('&');
  const url = `${GOOGLE_FONTS_BASE}${families}&display=swap`;
  const preconnect = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;
  const link = `<link href="${url}" rel="stylesheet">`;
  const preloads = fonts.map(f =>
    `<link rel="preload" as="style" href="${GOOGLE_FONTS_BASE}family=${f.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap">`
  ).join('\n');
  return `${preconnect}\n${preloads}\n${link}`;
}

// ========== Full-Page Template (used when HTML fragment is provided) ==========
const FRAME_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup Preview</title>
<link rel="stylesheet" href="/design-system.css">
FONTS_PLACEHOLDER
<style>
body { padding: 0; display: flex; flex-direction: column; min-height: 100vh; }
</style>
</head>
<body>
CONTENT_PLACEHOLDER
<script src="/mockup-tracker.js"></script>
</body>
</html>`;

// ========== Real Image Proxy (picsum.photos) — no API key needed ==========
function proxyImage(res, width, height, keyword) {
  // Use keyword as seed for deterministic images; fallback to session-unique
  const seed = keyword || `${SESSION_ID}-${width}x${height}`;
  const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;

  function fetchImage(imgUrl) {
    https.get(imgUrl, (proxyRes) => {
      if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        fetchImage(proxyRes.headers.location);
        return;
      }
      res.writeHead(200, {
        'Content-Type': proxyRes.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'max-age=3600',
      });
      proxyRes.pipe(res);
    }).on('error', () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="#EEECE8"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#9498A0" font-family="system-ui,sans-serif" font-size="14">Image unavailable</text>
      </svg>`;
      res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
      res.end(svg);
    });
  }
  fetchImage(url);
}

// ========== Map Page (Leaflet + OSM — no API key) ==========
function mapPage(lat, lng, zoom, markers) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Map</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin></script>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${lat}, ${lng}], ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
  ${markers.map(m => `L.marker([${m.lat}, ${m.lng}]).addTo(map).bindPopup('${m.label || ''}');`).join('\n  ')}
  var conn = new WebSocket('ws://' + window.location.host);
  conn.onmessage = function(m) { var d = JSON.parse(m.data); if(d.type === 'reload') window.location.reload(); };
</script>
</body>
</html>`;
}

// ========== Chart Page (Chart.js — no API key) ==========
function chartPage(type, labels, datasets, title) {
  const colors = ['#4A9E6E', '#E8714A', '#4A7B9E', '#9E6E4A', '#6E4A9E', '#9E4A6E'];
  const ds = datasets.map((d, i) => JSON.stringify({
    label: d.label || `Series ${i + 1}`,
    data: d.values,
    backgroundColor: colors[i % colors.length] + '66',
    borderColor: colors[i % colors.length],
    borderWidth: 2,
    fill: type === 'line' ? false : undefined,
  }));
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title || 'Chart'}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<style>
  html, body { height: 100%; margin: 0; padding: 16px; box-sizing: border-box; font-family: system-ui, sans-serif; }
  canvas { max-height: calc(100% - 40px); }
  h3 { margin: 0 0 8px 0; font-weight: 600; font-size: 1rem; color: #333; }
</style>
</head>
<body>
  ${title ? `<h3>${title}</h3>` : ''}
  <canvas id="chart"></canvas>
<script>
  new Chart(document.getElementById('chart'), {
    type: '${type}',
    data: { labels: ${JSON.stringify(labels)}, datasets: ${JSON.stringify(ds)} },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: ${datasets.length > 1} } },
      scales: { y: { beginAtZero: true } }
    }
  });
  var conn = new WebSocket('ws://' + window.location.host);
  conn.onmessage = function(m) { var d = JSON.parse(m.data); if(d.type === 'reload') window.location.reload(); };
</script>
</body>
</html>`;
}

// ========== Components CSS ==========
const COMPONENTS_CSS = `/* ========================================================================
   Mockup Components — CSS-only building blocks for richer mockups
   Usage:  <link rel="stylesheet" href="/components.css">
   ======================================================================== */

/* -- Status dots --------------------------------------------------- */
.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 9999px; }
.status-dot--online { background: #22c55e; }
.status-dot--offline { background: #ef4444; }
.status-dot--warning { background: #f59e0b; }
.status-dot--neutral { background: #9498A0; }

/* -- Mini sparkline (CSS-only bar chart) -------------------------- */
.sparkline { display: flex; align-items: end; gap: 2px; height: 32px; }
.sparkline__bar { width: 6px; border-radius: 2px 2px 0 0; background: var(--accent, #4A9E6E); min-height: 2px; opacity: 0.5; }
.sparkline__bar:nth-child(odd) { opacity: 0.3; }
.sparkline__bar:last-child { opacity: 0.8; }
.sparkline__bar:hover { opacity: 1; }

/* -- Progress bar ------------------------------------------------- */
.progress { height: 6px; border-radius: 3px; background: #e5e5e5; overflow: hidden; }
.progress__fill { height: 100%; border-radius: 3px; background: var(--accent, #4A9E6E); transition: width 0.3s; }

/* -- Stat card ---------------------------------------------------- */
.stat { display: inline-flex; flex-direction: column; gap: 2px; }
.stat__value { font-size: 1.75rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
.stat__label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.6; font-weight: 500; }
.stat__change { font-size: 0.8125rem; font-weight: 500; }
.stat__change--up { color: #22c55e; }
.stat__change--down { color: #ef4444; }

/* -- Data badge --------------------------------------------------- */
.data-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; background: var(--accent, #4A9E6E); color: #fff; }
.data-badge--outline { background: transparent; border: 1px solid; color: inherit; }

/* -- Tag/chip ----------------------------------------------------- */
.tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; background: #f0f0f0; color: #555; }

/* -- Mini donut (CSS conic-gradient) ------------------------------ */
.donut { display: inline-block; width: 40px; height: 40px; border-radius: 50%; position: relative; }
.donunt__inner { position: absolute; inset: 8px; border-radius: 50%; background: var(--bg, #fff); }
@keyframes donut-fill { from { transform: rotate(0deg); } }

/* -- Keyboard hint ------------------------------------------------ */
kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 22px; padding: 0 5px; font-family: inherit; font-size: 0.6875rem; border-radius: 4px; border: 1px solid; background: var(--kbd-bg, #f5f5f5); color: var(--kbd-fg, #666); }

/* -- Skeleton loader ---------------------------------------------- */
.skeleton { border-radius: 6px; background: linear-gradient(90deg, #e5e5e5 25%, #f0f0f0 50%, #e5e5e5 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; }
@keyframes skeleton-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* -- Timeline ----------------------------------------------------- */
.timeline { position: relative; padding-left: 24px; }
.timeline::before { content: ''; position: absolute; left: 7px; top: 4px; bottom: 4px; width: 2px; background: #e5e5e5; }
.timeline__item { position: relative; padding-bottom: 16px; }
.timeline__item::before { content: ''; position: absolute; left: -20px; top: 6px; width: 8px; height: 8px; border-radius: 50%; background: var(--accent, #4A9E6E); border: 2px solid var(--bg, #fff); }
.timeline__item:last-child { padding-bottom: 0; }

/* -- Toggle switch ------------------------------------------------ */
.toggle { position: relative; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.toggle__track { display: inline-block; width: 36px; height: 20px; border-radius: 10px; background: #e5e5e5; transition: background 0.2s; position: relative; }
.toggle__thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: transform 0.2s; }
.toggle input:checked + .toggle__track { background: var(--accent, #4A9E6E); }
.toggle input:checked + .toggle__track .toggle__thumb { transform: translateX(16px); }
.toggle input { position: absolute; opacity: 0; width: 0; height: 0; }

/* -- Data row (key-value line) ------------------------------------ */
.data-row { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; border-bottom: 1px solid; border-color: inherit; }
.data-row:last-child { border-bottom: none; }
.data-row__key { font-size: 0.8125rem; opacity: 0.6; }
.data-row__value { font-size: 0.875rem; font-weight: 600; text-align: right; }

/* -- Empty state --------------------------------------------------- */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; gap: 8px; }
.empty-state__icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: #f0f0f0; }
.empty-state__title { font-size: 1rem; font-weight: 600; }
.empty-state__desc { font-size: 0.875rem; opacity: 0.6; max-width: 280px; }
`;

// ========== Styles ==========
const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.json': 'application/json',
};

function isFullDocument(html) {
  const t = html.trimStart().toLowerCase();
  return t.startsWith('<!doctype') || t.startsWith('<html');
}

function getIndexFile() {
  // Only serve index.html at root — never fall back to newest file
  const indexPath = path.join(CONTENT_DIR, 'index.html');
  if (fs.existsSync(indexPath)) return indexPath;
  return null;
}

// ========== State ==========
let latestFile = null;
const clients = new Set();

// ========== HTTP ==========
function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Design System CSS
  if (pathname === '/design-system.css') {
    try {
      const css = fs.readFileSync(DESIGN_SYSTEM_CSS_PATH, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'max-age=60' });
      res.end(css);
    } catch {
      res.writeHead(404); res.end('Design system CSS not found');
    }
    return;
  }

  // Components CSS (CSS-only building blocks)
  if (pathname === '/components.css') {
    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'max-age=60' });
    res.end(COMPONENTS_CSS);
    return;
  }

  // Real image placeholder proxy: /placeholder/800x400 or /placeholder/800x400/chart or /placeholder/800x400/classroom
  const placeholderMatch = pathname.match(/^\/placeholder\/(\d+)x(\d+)(?:\/([a-zA-Z0-9_-]+))?$/);
  if (placeholderMatch) {
    const [_, w, h, keyword] = placeholderMatch;
    proxyImage(res, parseInt(w), parseInt(h), keyword || null);
    return;
  }

  // Real map: /map?lat=30.45&lng=-91.14&zoom=10 (Leaflet + OSM, no API key)
  if (pathname === '/map') {
    const lat = parseFloat(url.searchParams.get('lat')) || 30.45;
    const lng = parseFloat(url.searchParams.get('lng')) || -91.14;
    const zoom = parseInt(url.searchParams.get('zoom')) || 7;
    const markersRaw = url.searchParams.get('markers') || '';
    const markers = markersRaw ? markersRaw.split(';').filter(Boolean).map(m => {
      const [latStr, lngStr, ...labelParts] = m.split(',');
      return { lat: parseFloat(latStr), lng: parseFloat(lngStr), label: labelParts.join(',') };
    }) : [{ lat, lng, label: '' }];
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(mapPage(lat, lng, zoom, markers));
    return;
  }

  // Real chart: /chart?type=bar&labels=A,B,C&data=10,20,30&title=Sales (Chart.js, no API key)
  if (pathname === '/chart') {
    const type = url.searchParams.get('type') || 'bar';
    const labels = (url.searchParams.get('labels') || '').split(',').filter(Boolean);
    const dataStr = url.searchParams.get('data') || '';
    const dataAll = dataStr.split('|').filter(Boolean).map(s => s.split(',').map(Number).filter(n => !isNaN(n)));
    const titlesParam = (url.searchParams.get('series') || '').split('|').filter(Boolean);
    const title = url.searchParams.get('title') || '';
    const datasets = dataAll.map((values, i) => ({ values, label: titlesParam[i] || '' }));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(chartPage(type, labels, datasets.length ? datasets : [{ values: [] }], title));
    return;
  }

  // Tracker JS
  if (pathname === '/mockup-tracker.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    res.end(TRACKER_JS);
    return;
  }

  // Server info endpoint
  if (pathname === '/__info') {
    const info = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'server-info'), 'utf-8'));
    info.files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.html')).sort();
    info.events = fs.existsSync(path.join(STATE_DIR, 'events'))
      ? fs.readFileSync(path.join(STATE_DIR, 'events'), 'utf-8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
      : [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(info, null, 2));
    return;
  }

  // Main page
  if (pathname === '/') {
    const fp = getIndexFile();
    let html;
    if (fp) {
      html = fs.readFileSync(fp, 'utf-8');
      if (!isFullDocument(html)) {
        // It's a fragment — wrap in frame with design system
        const fontLinks = extractFontLinks(html);
        html = FRAME_TEMPLATE
          .replace('FONTS_PLACEHOLDER', fontLinks)
          .replace('CONTENT_PLACEHOLDER', html);
      }
      // Reset events for new screen
      const eventsFile = path.join(STATE_DIR, 'events');
      try { fs.unlinkSync(eventsFile); } catch {}
    } else {
      // No files yet — show waiting screen
      html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup</title>
<link rel="stylesheet" href="/design-system.css">
<style>
body { display:flex; align-items:center; justify-content:center; min-height:100vh; flex-direction:column; gap:1rem; text-align:center; padding:2rem; font-family:system-ui,sans-serif; color:#666; }
h2 { font-size:1.25rem; font-weight:600; color:#222; }
code { font-family:monospace; font-size:0.8rem; background:#f5f5f5; padding:0.25rem 0.5rem; border-radius:4px; }
</style>
</head>
<body>
  <h2>Waiting for mockup...</h2>
  <p>Write <code>index.html</code> to the content directory and it will appear here.</p>
  <code>content_dir: ${CONTENT_DIR}</code>
</body></html>`;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // Static files from content dir
  const safeName = path.basename(pathname);
  const filePath = path.join(CONTENT_DIR, safeName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const isCSS = ext === '.css';
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': isCSS ? 'max-age=60' : 'no-cache',
    });
    res.end(fs.readFileSync(filePath));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found. Available: /, /design-system.css, /components.css, /mockup-tracker.js, /placeholder/{w}x{h}/{keyword}, /map, /chart, /__info');
}

// ========== WebSocket ==========
function handleUpgrade(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${acceptKey(key)}\r\n\r\n`
  );
  clients.add(socket);

  let buf = Buffer.alloc(0);
  socket.on('data', chunk => {
    try {
      buf = Buffer.concat([buf, chunk]);
      while (buf.length > 0) {
        let r;
        try { r = decodeFrame(buf); } catch { socket.destroy(); return; }
        if (!r) break;
        buf = buf.slice(r.bytesConsumed);
        if (r.opcode === 0x01) {
          const text = r.payload.toString();
          try {
            const evt = JSON.parse(text);
            const eventsFile = path.join(STATE_DIR, 'events');
            fs.appendFileSync(eventsFile, JSON.stringify(evt) + '\n');
          } catch {}
        } else if (r.opcode === 0x08) {
          clients.delete(socket); socket.end(encodeFrame(0x08, Buffer.alloc(0))); return;
        } else if (r.opcode === 0x09) {
          socket.write(encodeFrame(0x0A, r.payload));
        }
      }
    } catch { socket.destroy(); }
  });
  socket.on('close', () => clients.delete(socket));
  socket.on('error', () => clients.delete(socket));
}

function broadcast(msg) {
  const frame = encodeFrame(0x01, Buffer.from(JSON.stringify(msg)));
  for (const s of clients) { try { s.write(frame); } catch {} }
}

// ========== File watcher ==========
function watchContent() {
  try {
    fs.watch(CONTENT_DIR, (_, filename) => {
      if (!filename || !filename.endsWith('.html')) return;
      const fp = path.join(CONTENT_DIR, filename);
      if (fs.existsSync(fp)) {
        latestFile = fp;
        broadcast({ type: 'reload' });
      }
    });
  } catch (e) {
    console.error(JSON.stringify({ type: 'warn', message: 'File watcher failed, live reload disabled', error: e.message }));
  }
}

// ========== Startup ==========
fs.mkdirSync(CONTENT_DIR, { recursive: true });
fs.mkdirSync(STATE_DIR, { recursive: true });

watchContent();

// Create initial events file
fs.writeFileSync(path.join(STATE_DIR, 'events'), '');

const server = http.createServer(handleRequest);
server.on('upgrade', handleUpgrade);

server.listen(PORT, HOST, () => {
  const addr = server.address();
  const url = `http://${URL_HOST}:${addr.port}`;
  const info = {
    type: 'server-started',
    port: addr.port,
    host: HOST,
    url: url,
    content_dir: CONTENT_DIR,
    state_dir: STATE_DIR,
    stop_command: `kill ${process.pid}`,
    features: ['live-reload', 'event-tracking', 'real-images', 'leaflet-maps', 'chart-js'],
  };

  // Write info for the skill to read
  fs.writeFileSync(path.join(STATE_DIR, 'server-info'), JSON.stringify(info) + '\n');

  // ===== PROMINENT URL OUTPUT =====
  const border = '═'.repeat(Math.min(url.length + 4, 60));
  console.log(`╔${border}╗`);
  console.log(`║  🔗  ${url}  ║`);
  console.log(`╚${border}╝`);
  console.log(`📁 content: ${CONTENT_DIR}`);
  console.log(`📁 state:   ${STATE_DIR}`);
  console.log(`\n${JSON.stringify(info)}`);
});

// Idle timeout — 30 min
let idleTimer = setTimeout(() => process.exit(0), 30 * 60 * 1000);
process.on('message', () => { idleTimer.refresh(); });
