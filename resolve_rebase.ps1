Write-Host "开始全自动解决 Git Rebase 冲突..." -ForegroundColor Green
$max_loops = 300
$loop = 0

while ($true) {
    $loop++
    if ($loop -gt $max_loops) {
        Write-Host "已达到最大安全循环次数限制，脚本退出。" -ForegroundColor Yellow
        break
    }

    # 检查是否还在 rebase 中
    $rebase_dir1 = Join-Path (Get-Item .).FullName ".git/rebase-merge"
    $rebase_dir2 = Join-Path (Get-Item .).FullName ".git/rebase-apply"
    if (-not (Test-Path $rebase_dir1) -and -not (Test-Path $rebase_dir2)) {
        Write-Host "检测到已成功完成或退出了 Rebase 状态！" -ForegroundColor Green
        break
    }

    # 获取冲突的文件列表
    $status = git status --porcelain
    $conflicts = @()
    foreach ($line in $status) {
        if ($line -match '^(UU|AA|UD|DU|AU|UA)\s+(.*)$') {
            $conflicts += $Matches[2].Trim()
        }
    }

    if ($conflicts.Count -eq 0) {
        Write-Host "当前无冲突，尝试继续 rebase..." -ForegroundColor Cyan
        git -c core.editor=true rebase --continue
        Start-Sleep -Milliseconds 500
        continue
    }

    Write-Host "检测到冲突文件: $($conflicts -join ', ')" -ForegroundColor Yellow

    # 检查是否所有的冲突文件都是自动生成文件 (assets/*.svg, src/static/activities.json)
    $only_generated = $true
    foreach ($file in $conflicts) {
        # 统一处理反斜杠
        $normalized_file = $file.Replace("\", "/")
        
        $is_svg = $normalized_file.StartsWith("assets/") -and $normalized_file.EndsWith(".svg")
        $is_json = $normalized_file -eq "src/static/activities.json"
        
        if (-not $is_svg -and -not $is_json) {
            $only_generated = $false
        }
    }

    if ($only_generated) {
        Write-Host "所有冲突均为自动生成的资源/数据文件，自动使用 --theirs 版本解决..." -ForegroundColor Cyan
        foreach ($file in $conflicts) {
            git checkout --theirs $file
            git add $file
        }
        Write-Host "已自动解决并暂存，正在继续变基..." -ForegroundColor Cyan
        git -c core.editor=true rebase --continue
    } else {
        Write-Host "检测到其他核心代码冲突，为了安全，脚本已退出！请手动解决冲突后再运行。" -ForegroundColor Red
        break
    }

    Start-Sleep -Milliseconds 200
}
