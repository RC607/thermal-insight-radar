param(
  [Parameter(Mandatory=$true)][string]$Url,
  [string]$Pattern = '反射率|发射率|辐射制冷|太阳反射|半球发射|制冷量|温降|标准号|专利|公开号|型号|参数',
  [int]$MaxLines = 25,
  [int]$MaxChars = 240
)
$ErrorActionPreference = 'Stop'
try {
  $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 25 -Headers @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
    'Accept-Language' = 'zh-CN,zh;q=0.9,en;q=0.8'
  }
} catch {
  Write-Output "FETCH_FAIL|$Url|$($_.Exception.Message)"
  return
}
$bytes = $resp.RawContentStream.ToArray()
$head = [System.Text.Encoding]::ASCII.GetString($bytes, 0, [Math]::Min(3000, $bytes.Length))
$gbk = [System.Text.Encoding]::GetEncoding('gb18030')
if ($head -match '(?i)charset=["'']?(gb2312|gbk|gb18030)') {
  $text = $gbk.GetString($bytes)
} else {
  try { $strict = [System.Text.Encoding]::GetEncoding('utf-8', [System.Text.EncoderFallback]::ExceptionFallback, [System.Text.DecoderFallback]::ExceptionFallback); $text = $strict.GetString($bytes) }
  catch { $text = $gbk.GetString($bytes) }
}
$text = [regex]::Replace($text, '(?is)<script.*?</script>|<style.*?</style>|<!--.*?-->', ' ')
$text = [regex]::Replace($text, '(?i)<br\s*/?>|</p>|</div>|</tr>|</li>|</h[1-6]>', "`n")
$text = [regex]::Replace($text, '<[^>]+>', ' ')
$text = [System.Net.WebUtility]::HtmlDecode($text)
$lines = $text -split "`n" | ForEach-Object { ($_ -replace '\s+', ' ').Trim() } | Where-Object { $_.Length -gt 6 }
$title = if ($resp.ParsedHtml) { '' } else { '' }
Write-Output "OK|$Url|status=$([int]$resp.StatusCode)|len=$($text.Length)"
if ($lines.Count -gt 0) { Write-Output ("TITLE_HINT|" + $lines[0].Substring(0, [Math]::Min(80, $lines[0].Length))) }
$hits = $lines | Where-Object { $_ -match $Pattern } | Select-Object -First $MaxLines
if (-not $hits) { $hits = $lines | Select-Object -First 8 }
foreach ($h in $hits) {
  if ($h.Length -gt $MaxChars) { $h = $h.Substring(0, $MaxChars) + '...' }
  Write-Output ("  " + $h)
}
