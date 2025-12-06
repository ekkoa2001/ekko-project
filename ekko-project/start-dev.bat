@echo off
echo Starting Ekko Project Development Environment...

echo Starting Server (Port 3001)...
start "Ekko Server" cmd /k "cd server && node index.js"

echo Starting Admin Dashboard (Port 5173/5174)...
start "Ekko Admin" cmd /k "cd admin && npm run dev"

echo Starting Client (Port 5173/5174)...
start "Ekko Client" cmd /k "cd client && npm run dev"

echo.
echo All services are launching in separate windows.
echo - Server: http://localhost:3001
echo - Admin: http://localhost:5174 (usually)
echo - Client: http://localhost:5173 (usually)
echo.
pause
