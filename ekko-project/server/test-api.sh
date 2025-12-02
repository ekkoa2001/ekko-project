#!/bin/bash

# Ekko API 测试脚本
# 用法: ./test-api.sh https://your-api-domain.com

API_URL=${1:-"http://localhost:3001"}

echo "🧪 测试 Ekko API Server"
echo "📍 API URL: $API_URL"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local headers=$5
  
  echo -n "Testing $name... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" $headers)
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      $headers \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    echo "   Response: $(echo $body | jq -c '.' 2>/dev/null || echo $body)"
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    echo "   Response: $(echo $body | jq -c '.' 2>/dev/null || echo $body)"
  fi
  echo ""
}

# 1. 健康检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Health Check" "GET" "/health"

# 2. 根路径
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  根路径"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Root Path" "GET" "/"

# 3. 用户注册
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  用户注册"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
REGISTER_DATA='{
  "email": "test-'$(date +%s)'@example.com",
  "password": "password123",
  "name": "Test User"
}'
register_response=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

echo "Response: $(echo $register_response | jq -c '.')"
TOKEN=$(echo $register_response | jq -r '.token')
echo -e "${YELLOW}Token: $TOKEN${NC}"
echo ""

# 4. 用户登录
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  用户登录"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LOGIN_DATA='{
  "email": "admin@ekko.com",
  "password": "password123"
}'
test_endpoint "User Login" "POST" "/api/auth/login" "$LOGIN_DATA"

# 5. 获取课程列表
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  获取课程列表"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
courses_response=$(curl -s "$API_URL/api/courses")
echo "Response: $(echo $courses_response | jq -c '.')"

# 获取第一个课程 ID
COURSE_ID=$(echo $courses_response | jq -r '.data[0].id')
echo -e "${YELLOW}First Course ID: $COURSE_ID${NC}"
echo ""

# 6. 获取课程详情
if [ ! -z "$COURSE_ID" ] && [ "$COURSE_ID" != "null" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "6️⃣  获取课程详情"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  test_endpoint "Course Detail" "GET" "/api/courses/$COURSE_ID"
fi

# 7. 创建订单（需要 Token）
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ] && [ ! -z "$COURSE_ID" ] && [ "$COURSE_ID" != "null" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "7️⃣  创建订单（需要认证）"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ORDER_DATA="{
    \"courseId\": \"$COURSE_ID\",
    \"amount\": 299
  }"
  test_endpoint "Create Order" "POST" "/api/orders/create" "$ORDER_DATA" "-H 'Authorization: Bearer $TOKEN'"
fi

# 8. 下载课程（需要 Token 和购买记录）
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ] && [ ! -z "$COURSE_ID" ] && [ "$COURSE_ID" != "null" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "8️⃣  下载课程（需要认证和购买）"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  download_response=$(curl -s "$API_URL/api/courses/$COURSE_ID/download" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response: $(echo $download_response | jq -c '.')"
  
  DOWNLOAD_URL=$(echo $download_response | jq -r '.data.downloadUrl')
  if [ ! -z "$DOWNLOAD_URL" ] && [ "$DOWNLOAD_URL" != "null" ]; then
    echo -e "${GREEN}✓ 下载链接生成成功${NC}"
    echo -e "${YELLOW}Download URL: ${DOWNLOAD_URL:0:80}...${NC}"
  fi
  echo ""
fi

# 9. Rate Limiting 测试
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  Rate Limiting 测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "发送 10 个快速请求..."
for i in {1..10}; do
  response=$(curl -s -w "%{http_code}" -o /dev/null "$API_URL/api/courses")
  if [ "$response" == "429" ]; then
    echo -e "${YELLOW}✓ Rate Limit 触发 (第 $i 次请求)${NC}"
    break
  fi
done
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 测试完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
