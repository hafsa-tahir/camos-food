Add-Type -AssemblyName System.Drawing
$srcPath = 'C:\Users\LENOVO\.gemini\antigravity-ide\brain\a8811792-de8a-49f6-a8f5-8bccf1e44610\.user_uploaded\media_1790436432574.png'
$destPath = 'c:\Users\LENOVO\Desktop\foodapp\public\logo.png'

# First copy the raw original logo
Copy-Item -Path $srcPath -Destination $destPath -Force
Write-Host "Copied logo to $destPath"

# Also create high-res cropped version with transparent background
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$outBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($outBmp)
$g.DrawImage($bmp, 0, 0, $bmp.Width, $bmp.Height)
$g.Dispose()
$bmp.Dispose()

# Flood fill outer white border to transparent
$visited = New-Object 'bool[,]' $outBmp.Width, $outBmp.Height
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

# Enqueue border pixels
for ($x = 0; $x -lt $outBmp.Width; $x++) {
    $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
    $queue.Enqueue((New-Object System.Drawing.Point($x, ($outBmp.Height - 1))))
}
for ($y = 0; $y -lt $outBmp.Height; $y++) {
    $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
    $queue.Enqueue((New-Object System.Drawing.Point(($outBmp.Width - 1), $y)))
}

while ($queue.Count -gt 0) {
    $p = $queue.Dequeue()
    $px = $p.X
    $py = $p.Y
    if ($px -lt 0 -or $px -ge $outBmp.Width -or $py -lt 0 -or $py -ge $outBmp.Height) { continue }
    if ($visited[$px, $py]) { continue }
    $visited[$px, $py] = $true

    $c = $outBmp.GetPixel($px, $py)
    # If light outer background
    if ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) {
        $outBmp.SetPixel($px, $py, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        $queue.Enqueue((New-Object System.Drawing.Point(($px + 1), $py)))
        $queue.Enqueue((New-Object System.Drawing.Point(($px - 1), $py)))
        $queue.Enqueue((New-Object System.Drawing.Point($px, ($py + 1))))
        $queue.Enqueue((New-Object System.Drawing.Point($px, ($py - 1))))
    }
}

$transPath = 'c:\Users\LENOVO\Desktop\foodapp\public\logo-transparent.png'
$outBmp.Save($transPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()
Write-Host "Saved transparent logo to $transPath"
