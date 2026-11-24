# 挂网部署与每日自动更新

目标：给一个**公网链接**，别人点开就能看；数据**每天自动更新**；**不依赖你的电脑开机**。

---

## 先说清楚一件事

代码这边我已经做完了，包括：

- 站点已**静态化**：`node tools/build-static.mjs` → 产出 `dist/`（约 0.6 MB，纯静态，无需 Node 后端）
- **每日自动更新流水线**已写好：`.github/workflows/daily.yml`（每天北京时间 05:20 跑一次，重抓文献 → 重建 → 发布）
- 静态产物**已在本地验证可用**（见 `shots/` 与本文末尾的验证记录）

**唯一卡住的一步是托管账号。** GitHub / Cloudflare / Netlify 都要账号才能发布，注册要邮箱验证、要本人同意服务条款——这一步我不能代你做，替别人注册账号也不合规。除此之外的活，我都已经铺好了。

你可以选下面任意一条路，**A 最省事且完全满足"每日更新 + 不依赖你电脑"**。

---

## A. GitHub Pages（推荐：免费 + 自带每日定时 + 永久在线）

**一次性 5 步，约 3 分钟：**

1. 打开 <https://github.com/new>，Repository name 填 `thermal-insight-radar`，可见性选 **Public**，点 Create（不要勾 README）。
2. 把本目录的代码推上去（在项目根目录执行，把 `你的用户名` 换掉）：

   ```bat
   git init
   git add .
   git commit -m "init: 隔热情报雷达"
   git branch -M main
   git remote add origin https://github.com/你的用户名/thermal-insight-radar.git
   git push -u origin main
   ```

   > 推送时会要求登录。GitHub 已不支持账号密码，用 **Personal Access Token** 当密码（见文末「凭据怎么给」）。

3. 打开仓库 **Settings → Pages**，把 **Source** 选成 **GitHub Actions**（不是 Deploy from a branch）。
4. 回到 **Actions** 标签，选 `daily-build-and-deploy` → **Run workflow** 手动跑一次（之后每天 05:20 自动跑）。
5. 等 1–2 分钟，链接就是：

   ```
   https://你的用户名.github.io/thermal-insight-radar/
   ```

   这个地址可以直接发给别人。手机、微信内置浏览器都能开。

**跑起来之后：** 每天 05:20（北京时间）自动抓 Crossref 新文献 → 重建站点 → 发布；每次数据变化都会 commit 一次，仓库历史里能翻到"某天的数据长什么样"。

> 注：免费账号的 Pages 要求仓库为 public。这个站的数据全部是公开渠道信息，源码里也没有任何密钥（自检脚本会扫），所以 public 没有额外风险。

---

## B. Cloudflare Pages（最快上线，适合先给人看）

1. 登录 <https://dash.cloudflare.com/> → **Workers & Pages** → **Create** → **Pages** → **Upload assets**。
2. 项目名填 `thermal-insight-radar`，把本地的 **`dist` 文件夹**整个拖进去，Deploy。
3. 得到 `https://thermal-insight-radar.pages.dev`。
4. 想要每天自动更新：在 GitHub 仓库里加一个 Secret（`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`），把 `.github/workflows/daily.yml` 的 deploy 段换成 `cloudflare/pages-action`，或在 Cloudflare 里连上 Git 仓库、构建命令填 `node tools/build-static.mjs`、输出目录填 `dist`。

> 这条路 5 分钟能拿到链接，但"每天自动更新"要再做一步；如果你要一步到位，选 A。

---

## C. Netlify（连仓库即用）

`netlify.toml` 已经配好（build command = `node tools/build-static.mjs`，publish = `dist`）。在 Netlify 里 **Add new site → Import an existing project** 选中该仓库即可。每晚更新可以再配一个 Build hook + 定时任务，或在 GitHub Actions 里用 `npx netlify-cli deploy --prod`。

---

## D. 想让我全自动做完？

给我一个 GitHub **Fine-grained Personal Access Token**，我就能：建仓库 → 推代码 → 打开 Pages → 触发首次构建 → 把公网链接给你，全程不用你动手。

**权限只勾这四项**（Other → Fine-grained tokens → Generate new token）：

| 权限 | 级别 |
| --- | --- |
| Repository permissions → **Contents** | Read and write |
| Repository permissions → **Workflows** | Read and write |
| Repository permissions → **Pages** | Read and write |
| Repository permissions → **Administration** | Read and write |

有效期选 7 天即可。把 token 发我，我做完之后你可以立刻在 <https://github.com/settings/tokens> 撤销。

> 安全提醒：token 等于密码，别发在公开群里；用完就撤。我不会把它写进任何文件（`.gitignore` 已排除临时文件）。

---

## 每日更新，更新的是什么？（别误解）

| 内容 | 是否自动更新 | 说明 |
| --- | --- | --- |
| 学术文献库（415 条） | ✅ 每天 | CI 每天重新调 Crossref 开放接口抓增量，去重后合并 |
| 站点构建时间 / 统计 | ✅ 每天 | 构建时重算覆盖矩阵、核验分布、年度趋势 |
| 生产商 / 产品资料 / 标准专利（130 条） | ❌ 不自动 | 这些是逐页人工核验的数据，必须有人去读原始页面才能加。**让它"自动更新"就等于让机器编造企业信息和参数**——不做。要加就本地跑 `node server/server.mjs`，用「录入情报」补录，或把来源发我。 |

静态站点是**只读**的：写入、Crossref 在线抓取、X-Mol 粘贴导入这些入口在静态版里自动隐藏，避免别人误以为能改数据。

---

## 本地预览与自检（部署前）

```bat
node tools/build-static.mjs        :: 生成 dist/
node tools/serve-static.mjs        :: http://127.0.0.1:8899 预览静态版
node tools/verify-static.mjs       :: 静态产物自检（缺文件/缺来源/明文密钥）
```

## 常见问题

**Q：链接能不能自定义？** 可以。GitHub Pages 支持在 Settings → Pages 绑定自定义域名（需要你有域名并在 DNS 加 CNAME）；Cloudflare Pages 也支持。

**Q：仓库能不能私有？** 私有仓库 + Pages 需要 GitHub Pro。想私有又要公网访问，用 Cloudflare Pages 连私有仓库。

**Q：每天 05:20 跑，会不会因为网络问题失败？** 抓取那一步设了 `continue-on-error`，抓不到就用上一版数据继续构建发布，站点不会挂。失败记录可在 Actions 里看到。

**Q：数据要不要备份？** 每次变更都 commit，仓库本身就是备份。
