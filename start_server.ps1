# 启动简单的HTTP服务器
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()
Write-Host "服务器已启动: http://localhost:8000/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $path = $request.Url.LocalPath
        
        if ($path -eq '/') {
            $path = '/index.html'
        }
        
        $file = Join-Path -Path (Get-Location).Path -ChildPath $path.Substring(1)
        
        if (Test-Path $file -PathType Leaf) {
            $contentType = 'text/html'
            if ($file -match '\.css$') {
                $contentType = 'text/css'
            } elseif ($file -match '\.js$') {
                $contentType = 'application/javascript'
            }
            
            $response.ContentType = $contentType
            $content = [System.IO.File]::ReadAllBytes($file)
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $content = [System.Text.Encoding]::UTF8.GetBytes('404 - 找不到文件')
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        }
        
        $response.Close()
    } catch {
        Write-Host $_.Exception.Message
    }
}