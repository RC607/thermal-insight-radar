/**
 * 零依赖截图/交互驱动：通过 Chrome DevTools Protocol 控制本机 Edge/Chrome。
 * 不装 puppeteer，仅用 Node 内置 WebSocket + fetch。
 *
 * 用法示例：
 *   node tools/shot.mjs --url "http://127.0.0.1:8788/" --out shots/01-home.png --full
 *   node tools/shot.mjs --url "..." --out a.png --eval "document.querySelector('[data-sub=dc-3]').click()" --wait-for ".data"
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const argv = process.argv.slice(2);
const arg = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : null
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findBrowser() {
  for (const p of EDGE_CANDIDATES) {
    if (!p) continue;
    try {
      await fs.access(p);
      return p;
    } catch {
      /* next */
    }
  }
  throw new Error('未找到 Edge/Chrome 可执行文件');
}

async function waitPort(port, timeoutMs = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch {
      /* retry */
    }
    await sleep(150);
  }
  throw new Error('浏览器调试端口未就绪');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        (this.events.get(msg.method) || []).forEach((fn) => fn(msg.params));
      }
    });
  }
  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', (e) => reject(new Error(`WS 连接失败: ${e.message || 'error'}`)), { once: true });
    });
    return new CDP(ws);
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP 超时: ${method}`));
        }
      }, 45000);
    });
  }
  on(method, fn) {
    if (!this.events.has(method)) this.events.set(method, []);
    this.events.get(method).push(fn);
  }
  close() {
    try {
      this.ws.close();
    } catch {
      /* noop */
    }
  }
}

async function main() {
  const url = arg('url');
  const out = arg('out', 'shots/shot.png');
  const width = Number(arg('width', 1600));
  const viewportHeight = Number(arg('height', 1000));
  const evalJs = arg('eval');
  const evalFile = arg('eval-file');
  const evalCode = evalFile ? await fs.readFile(path.resolve(evalFile), 'utf8') : evalJs;
  const waitFor = arg('wait-for');
  const waitMs = Number(arg('wait-ms', 700));
  const full = has('full');
  const port = Number(arg('port', 9600 + Math.floor(Math.random() * 300)));

  if (!url) throw new Error('缺少 --url');

  const browser = await findBrowser();
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'cdp-profile-'));
  const child = spawn(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--force-device-scale-factor=1',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      'about:blank'
    ],
    { stdio: 'ignore', detached: false }
  );

  let cdp;
  try {
    await waitPort(port);
    const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
    const target = await targetRes.json();
    cdp = await CDP.connect(target.webSocketDebuggerUrl);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: viewportHeight,
      deviceScaleFactor: 1,
      mobile: false
    });
    await cdp.send('Page.navigate', { url });

    // 等待 SPA 数据渲染就绪
    const deadline = Date.now() + 25000;
    let ready = false;
    while (Date.now() < deadline) {
      await sleep(300);
      const st = await cdp.send('Runtime.evaluate', {
        expression: waitFor
          ? `!!document.querySelector(${JSON.stringify(waitFor)})`
          : `document.readyState === 'complete' && (document.querySelector('#view') ? document.querySelector('#view').children.length > 0 : true)`,
        returnByValue: true
      });
      if (st.result?.value) {
        ready = true;
        break;
      }
    }
    if (!ready) console.warn('[warn] 等待条件未满足，仍尝试截图');

    if (evalCode) {
      const r = await cdp.send('Runtime.evaluate', { expression: evalCode, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) console.warn('[eval 异常]', r.exceptionDetails.text, r.result?.description || '');
      else if (r.result?.value !== undefined) console.log('[eval]', String(r.result.value).slice(0, 200));
    }
    await sleep(waitMs);

    let clip = null;
    if (full) {
      const m = await cdp.send('Runtime.evaluate', {
        expression: `(() => { const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight); return Math.min(h, 12000); })()`,
        returnByValue: true
      });
      const pageH = Math.ceil(m.result.value || viewportHeight);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: pageH,
        deviceScaleFactor: 1,
        mobile: false
      });
      await sleep(450);
      clip = { x: 0, y: 0, width, height: pageH, scale: 1 };
    }

    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: !!full,
      ...(clip ? { clip } : {})
    });
    await fs.mkdir(path.dirname(out), { recursive: true });
    await fs.writeFile(out, Buffer.from(shot.data, 'base64'));
    const stat = await fs.stat(out);
    console.log(`✓ ${out}  ${stat.size} bytes`);
  } finally {
    cdp?.close();
    try {
      child.kill();
    } catch {
      /* noop */
    }
    await sleep(300);
    fs.rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error('截图失败：', err.message);
  process.exit(1);
});
