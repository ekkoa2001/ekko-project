# Ekko API 测试脚本 (PowerShell)
# 用法: .\test-api.ps1 -ApiUrl "https://your-api-domain.com"

param(
    [string]$ApiUrl = "http://localhost:3001"
)

Write-Host "🧪 测试 Ekko API Server" -ForegroundColor Cyan
Write-Host "📍 API URL: $ApiUrl" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = $null,
        [string]$Token = $null
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $url = "$ApiUrl$Endpoint"
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -Body $Data
        }
        
        Write-Host "✓ PASS" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        return $response
    }
    catch {
        Write-Host "✗ FAIL" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
    
    Write-Host ""
}

# 1. 健康检查
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "1️⃣  健康检查" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Test-Endpoint -Name "Health Check" -Method "GET" -Endpoint "/health"

# 2. 根路径
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "2️⃣  根路径" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Test-Endpoint -Name "Root Path" -Method "GET" -Endpoint "/"

# 3. 用户注册
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "3️⃣  用户注册" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$registerData = @{
    email = "test-$timestamp@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

$registerResponse = Test-Endpoint -Name "User Register" -Method "POST" -Endpoint "/api/auth/register" -Data $registerData

if ($registerResponse) {
    $token = $registerResponse.token
    Write-Host "Token: $token" -ForegroundColor Yellow
}

# 4. 用户登录
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "4️⃣  用户登录" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$loginData = @{
    email = "admin@ekko.com"
    password = "password123"
} | ConvertTo-Json

Test-Endpoint -Name "User Login" -Method "POST" -Endpoint "/api/auth/login" -Data $loginData

# 5. 获取课程列表
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "5️⃣  获取课程列表" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$coursesResponse = Test-Endpoint -Name "Get Courses" -Method "GET" -Endpoint "/api/courses"

if ($coursesResponse -and $coursesResponse.data) {
    $courseId = $coursesResponse.data[0].id
    Write-Host "First Course ID: $courseId" -ForegroundColor Yellow
    
    # 6. 获取课程详情
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "6️⃣  获取课程详情" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Test-Endpoint -Name "Course Detail" -Method "GET" -Endpoint "/api/courses/$courseId"
    
    # 7. 创建订单（需要 Token）
    if ($token) {
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        Write-Host "7️⃣  创建订单（需要认证）" -ForegroundColor Yellow
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        
        $orderData = @{
            courseId = $courseId
            amount = 299
        } | ConvertTo-Json
        
        Test-Endpoint -Name "Create Order" -Method "POST" -Endpoint "/api/orders/create" -Data $orderData -Token $token
        
        # 8. 下载课程
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        Write-Host "8️⃣  下载课程（需要认证和购买）" -ForegroundColor Yellow
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        
        $downloadResponse = Test-Endpoint -Name "Download Course" -Method "GET" -Endpoint "/api/courses/$courseId/download" -Token $token
        
        if ($downloadResponse -and $downloadResponse.data.downloadUrl) {
            Write-Host "✓ 下载链接生成成功" -ForegroundColor Green
            $downloadUrl = $downloadResponse.data.downloadUrl
            Write-Host "Download URL: $($downloadUrl.Substring(0, [Math]::Min(80, $downloadUrl.Length)))..." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ 测试完成！" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
