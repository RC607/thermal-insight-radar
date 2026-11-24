# 挂网部署与每日自动更新

## ✅ 已上线

**公网地址：<https://rc607.github.io/thermal-insight-radar/>**

- 仓库：<https://github.com/RC607/thermal-insight-radar>（Public，35 个文件）
- 托管：GitHub Pages（`build_type = workflow`，已强制 HTTPS）
- 自动更新：GitHub Actions `daily-build-and-deploy`，每天北京时间 **05:20** 跑一次
- 首次部署与首次每日构建均已跑通：全部步骤 success，单次约 78 秒

---

## 每日更新怎么工作

`每天 05:20（UTC 21:20）` 或**每次 push 到 main** 时，`.github/workflows/daily.yml` 依次执行：

1. 检出仓库 → 准备 Node 20
2. `node tools/fetch-crossref.mjs`：按 22 组检索式抓 Crossref，**合并**进 `data/literature.json`
   （合并模式会保留 X-Mol 粘贴导入/手工补录的条目，不会被冲掉；抓取失败则跳过，不阻塞发布）
3. `node tools/build-static.mjs`：生成 `dist/`
4. `node tools/verify-static.mjs`：自检（文件齐全 / 来源完整 / 无明文密钥）
5. 数据有变化则 commit 回仓库（留痕，可回溯某天的数据）
6. 上传并部署到 Pages

**注意**：每日任务**不再重跑** `tools/seed-records.mjs`。`data/records.json` 是仓库里的事实来源，
种子脚本只在初始搭建/重建基线时手动运行——否则每天一次会把网页上手工补录的企业/产品记录冲掉。

---

## 怎么加数据（企业 / 产品 / 标准）

本地跑完整版（可写入）：

```bat
node server/server.mjs --port 8788
```

打开 <http://127.0.0.1:8788> → 「录入情报」→ 填表（**必须填来源 URL**）→ 写入。
然后把它推到仓库，云端会自动重建并发布：

```bat
git add data/records.json
git commit -m "data: 新增 XX 公司/产品"
git push
```

约 1–2 分钟后线上就能看到。

> 静态站点本身是**只读**的：写入、Crossref 在线抓取、X-Mol 粘贴导入这些入口只在本地版可用。

---

## 其他托管方案（备用）

### Cloudflare Pages（最快上线，适合先给人看）

Dashboard → Workers & Pages → Create → Pages → **Upload assets** → 把 `dist` 文件夹或 `deliverables/thermal-radar-site.zip` 拖进去 → Deploy。
每日更新需再接 `cloudflare/pages-action` 或 Cloudflare 的 Git 集成（构建命令 `node tools/build-static.mjs`，输出目录 `dist`）。

### Netlify（连仓库即用）

`netlify.toml` 已配好（build = `node tools/build-static.mjs`，publish = `dist`）。Import an existing project 选中该仓库即可。

### 全自动发布脚本（换账号 / 换仓库时用）

```powershell
$env:GH_TOKEN = "github_pat_xxx"   # 需要 Contents / Workflows / Pages / Administration 权限
pwsh -File deploy/publish-github.ps1 -Repo 新仓库名
```

脚本会：校验身份 → 建仓库 → 推送 → 开启 Pages（workflow 模式）→ 触发首次构建 → 打印地址。

---

## 本地预览与自检（部署前）

```bat
node tools/build-static.mjs        :: 生成 dist/
node tools/serve-static.mjs        :: http://127.0.0.1:8899 预览静态版
node tools/verify-static.mjs       :: 静态产物自检
```

## 常见问题

**Q：GitHub 会不会自动停掉定时任务？** 定时工作流在仓库连续 60 天无活动后会被暂停。本项目每天都会 commit 数据（哪怕只有文献变动），因此不会被暂停；万一被停，去 Actions 页面点一次 Enable 即可。

**Q：想立刻更新，不等 05:20？** Actions → `daily-build-and-deploy` → **Run workflow**；或者本地改完 `git push`（push 也会触发）。

**Q：链接能不能换域名？** Settings → Pages → Custom domain 绑定你自己的域名（DNS 加 CNAME）。

**Q：失败了怎么查？** Actions 里点进红色那次运行，展开失败步骤看日志；抓取步骤失败不影响发布（有 `continue-on-error`）。

