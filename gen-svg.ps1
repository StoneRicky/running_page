# 设置变量
$ATHLETE = "StoneRicky"
$TITLE = "Stone Running"
$TITLE_GRID = "Over 10km Runs"

Write-Host "start..." -ForegroundColor Cyan

python run_page/coros_sync.py unsername password
python run_page/db_updater.py
# 1. gen main GitHub style poster (github.svg)
python run_page/gen_svg.py --from-db --title "$TITLE" --type github --github-style "align-firstday" --athlete "$ATHLETE" --special-distance 10 --special-distance2 20 --output assets/github.svg --use-localtime --min-distance 0.5

# 2. gen grid poster (grid.svg)
python run_page/gen_svg.py --from-db --title "$TITLE_GRID" --type grid --athlete "$ATHLETE" --output assets/grid.svg --special-distance 20 --special-distance2 40 --use-localtime --min-distance 10

Write-Host "gen current year poster" -ForegroundColor Cyan
# 3. gen current year poster (github_yyyy.svg)
python run_page/gen_svg.py --from-db --type circular --use-localtime
$CURRENT_YEAR = Get-Date -Format "yyyy"
python run_page/gen_svg.py --from-db --year $CURRENT_YEAR --language zh_CN --title "$CURRENT_YEAR Running" --type github --github-style "align-firstday" --athlete "$ATHLETE" --special-distance 10 --special-distance2 20 --output "assets/github_$CURRENT_YEAR.svg" --use-localtime --min-distance 0.5


python run_page/gen_svg.py --from-db --type year_summary --output assets/year_summary.svg --athlete "$ATHLETE"
python run_page/save_to_parqent.py
Write-Host "success! please check assets directory." -ForegroundColor Green
