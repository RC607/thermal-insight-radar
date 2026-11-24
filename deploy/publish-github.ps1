# GitHub Pages 一键发布（需要 Fine-grained PAT，不需要账号密码）
#
# 用法（把 token 放在环境变量里，别写进命令行历史）：
#   $env:GH_TOKEN = "github_pat_xxx"
#   pwsh -File deploy/publish-github.ps1
#
# 可选参数：
#   -Repo  仓库名，默认 thermal-insight-radar
#   -Owner 用户名，默认用 token 对应账号
#
# 这个脚本做的事：
#   1) 校验 token 身份
#   2) 创建 public 仓库（已存在则复用）
#   3) git init/commit/push（token 通过 http.extraheader 传递，不落盘到 .git/config）
#   4) 开启 Pages（build_type = workflow）
#   5) 手动触发一次 daily-build-and-deploy
#   6) 打印最终公网地址

param(
  [string]$Repo = 'thermal-insight-radar',
  [string]$Owner = ''
)

$ErrorActionPreference = 'Stop'
$token = $env:GH_TOKEN
if (-not $token) {
  Write-Host '缺少 GH_TOKEN。请先设置环境变量：$env:GH_TOKEN = "github_pat_xxx"' -ForegroundColor Red
  exit 1
}

$headers = @{
  Authorization          = "Bearer $token"
  Accept                 = 'application/vnd.github+json'
  'X-GitHub-Api-Version' = '2022-11-28'
  'User-Agent'           = 'thermal-radar-deploy'
}
$api = 'https://api.github.com'

function Step($msg) { Write-Host "`n== $msg" -ForegroundColor Cyan }

Step '1/6 校验 token'
$me = Invoke-RestMethod "$api/user" -Headers $headers -TimeoutSec 30
if (-not $Owner) { $Owner = $me.login }
Write-Host "  账号：$($me.login)"
$scopes = (Invoke-WebRequest "$api/user" -Headers $headers -UseBasicParsing).Headers['x-oauth-scopes']
if ($scopes) { Write-Host "  classic token scopes: $scopes" } else { Write-Host "  fine-grained token（权限按仓库授权）" }

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Step '2/6 检查 / 创建仓库'
$repoUrl = "$api/repos/$Owner/$Repo"
$exists = $true
try { Invoke-RestMethod $repoUrl -Headers $headers -TimeoutSec 30 | Out-Null } catch { $exists = $false }

if ($exists) {
  Write-Host "  仓库已存在，复用：$Owner/$Repo"
} else {
  $body = @{
    name        = $Repo
    description = '隔热情报雷达：透明陶瓷隔热（铯钨青铜）与辐射制冷行业情报检索'
    private     = $false
    has_issues  = $false
    has_wiki    = $false
  } | ConvertTo-Json
  Invoke-RestMethod "$api/user/repos" -Method Post -Headers $headers -Body $body -ContentType 'application/json' -TimeoutSec 60 | Out-Null
  Write-Host "  已创建 public 仓库：$Owner/$Repo"
}

Step '3/6 提交并推送代码'
if (-not (Test-Path (Join-Path $root '.git'))) {
  git init | Out-Null
  Write-Host '  已初始化 git 仓库'
}
git add -A
$pending = git status --porcelain
if ($pending) {
  git -c "user.name=$Owner" -c "user.email=$Owner@users.noreply.github.com" commit -m 'init: 隔热情报雷达（静态化 + 每日自动更新）' | Out-Null
  Write-Host '  已生成提交'
} else {
  Write-Host '  无新增改动'
}
git branch -M main 2>$null

$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$token"))
$remote = "https://github.com/$Owner/$Repo.git"
git remote remove origin 2>$null | Out-Null
git remote add origin $remote
git -c http.extraheader="AUTHORIZATION: basic $basic" push -u origin main --force
Write-Host "  已推送 → $remote"

Step '4/6 开启 GitHub Pages（Source = GitHub Actions）'
$pagesBody = @{ build_type = 'workflow' } | ConvertTo-Json
try {
  Invoke-RestMethod "$api/repos/$Owner/$Repo/pages" -Method Post -Headers $headers -Body $pagesBody -ContentType 'application/json' -TimeoutSec 40 | Out-Null
  Write-Host '  Pages 已开启'
} catch {
  try {
    Invoke-RestMethod "$api/repos/$Owner/$Repo/pages" -Method Put -Headers $headers -Body $pagesBody -ContentType 'application/json' -TimeoutSec 40 | Out-Null
    Write-Host '  Pages 已更新为 workflow 模式'
  } catch {
    Write-Host "  Pages 自动开启失败（可在 Settings → Pages 手动选 GitHub Actions）：$($_.Exception.Message)" -ForegroundColor Yellow
  }
}

Step '5/6 触发首次构建'
Start-Sleep -Seconds 3
$dispatch = @{ ref = 'main' } | ConvertTo-Json
try {
  Invoke-RestMethod "$api/repos/$Owner/$Repo/actions/workflows/daily.yml/dispatches" -Method Post -Headers $headers -Body $dispatch -ContentType 'application/json' -TimeoutSec 40 | Out-Null
  Write-Host '  已触发 daily-build-and-deploy'
} catch {
  Write-Host "  触发失败（可稍后在 Actions 页手动点 Run workflow）：$($_.Exception.Message)" -ForegroundColor Yellow
}

Step '6/6 完成'
Write-Host ''
Write-Host "  仓库： https://github.com/$Owner/$Repo" -ForegroundColor Green
Write-Host "  站点： https://$Owner.github.io/$Repo/" -ForegroundColor Green
Write-Host "  构建： https://github.com/$Owner/$Repo/actions" -ForegroundColor Green
Write-Host ''
Write-Host '  首次构建约需 1–2 分钟；之后每天北京时间 05:20 自动更新。'
Write-Host '  收尾：用完请到 https://github.com/settings/tokens 撤销该 token。'
