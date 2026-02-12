# 设置变量
$ATHLETE = "StoneRicky"
$TITLE = "Stone Running"
$TITLE_GRID = "Over 10km Runs"
$BIRTHDAY_MONTH = "1995-08"
$CURRENT_YEAR = Get-Date -Format "yyyy"

if (!(Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets"
    Write-Host "Created assets directory." -ForegroundColor Yellow
}

Write-Host "--- Start Data Syncing ---" -ForegroundColor Cyan

# 请替换下面的凭据
python run_page/coros_sync.py username password
python run_page/db_updater.py

Write-Host "--- Generating All Years SVGs ---" -ForegroundColor Cyan

# 1. 生成全局统计图
python run_page/gen_svg.py --from-db --title "$TITLE" --type github --github-style "align-firstday" --athlete "$ATHLETE" --special-distance 10 --special-distance2 20 --output assets/github.svg --use-localtime --min-distance 0.5
python run_page/gen_svg.py --from-db --title "$TITLE_GRID" --type grid --athlete "$ATHLETE" --output assets/grid.svg --special-distance 20 --special-distance2 40 --use-localtime --min-distance 10

# 2. 关键修改：生成所有历史年份的 GitHub 统计图
# 使用 --generate-all-years 参数可以一次性补齐 2024, 2023 等所有年份
python run_page/gen_svg.py --from-db --type github --year all --generate-all-years --github-style "align-firstday" --athlete "$ATHLETE" --special-distance 10 --special-distance2 20 --use-localtime --min-distance 0.5

# 3. 生成所有历史年份的环形图
python run_page/gen_svg.py --from-db --type circular --use-localtime

# 4. 生成年度总结和生命月份图
python run_page/gen_svg.py --from-db --type year_summary --output assets/year_summary.svg --athlete "$ATHLETE"

Write-Host "Generating Month of Life SVGs..." -ForegroundColor Cyan
$MOL_TYPES = @("running", "walking", "hiking", "cycling", "swimming", "skiing", "all")
foreach ($type in $MOL_TYPES) {
    $outputName = if ($type -eq "all") { "mol.svg" } else { "mol_$type.svg" }
    python run_page/gen_svg.py --from-db --type monthoflife --birth "$BIRTHDAY_MONTH" --output "assets/$outputName" --use-localtime --athlete "$ATHLETE" --title "$($type.ToUpper()) Month of Life" --sport-type $type
}

Write-Host "Success! Please check if github_2024.svg now exists in assets/." -ForegroundColor Green