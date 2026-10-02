Add-Type -AssemblyName System.Drawing
$filePath = Join-Path (Get-Location) "public\camos-logo.jpg"
$outPath = Join-Path (Get-Location) "public\logo-transparent.png"

$img = [System.Drawing.Bitmap]::FromFile($filePath)
$outBmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($x = 0; $x -lt $img.Width; $x++) {
    for ($y = 0; $y -lt $img.Height; $y++) {
        $c = $img.GetPixel($x, $y)
        # Check if color is light background (white, light cream, pale yellow)
        if ($c.R -gt 215 -and $c.G -gt 215 -and $c.B -gt 170) {
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $outBmp.SetPixel($x, $y, $c)
        }
    }
}

$img.Dispose()
$outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()
Write-Host "Saved 100% transparent PNG logo to $outPath"
