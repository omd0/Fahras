@echo off
echo Initializing MinIO bucket for Fahras...

REM Wait for MinIO to be ready
echo Waiting for MinIO to be ready...
:wait_minio
curl -f http://localhost:9000/minio/health/live >nul 2>&1
if errorlevel 1 (
    echo MinIO is not ready yet. Waiting...
    timeout /t 2 >nul
    goto wait_minio
)

echo MinIO is ready!

REM Download and setup MinIO client (mc) for Windows
echo Installing MinIO client...
curl -L https://dl.min.io/client/mc/release/windows-amd64/mc.exe -o mc.exe

REM Configure MinIO client
mc.exe alias set local http://localhost:9000 minioadmin minioadmin123

REM Create bucket
echo Creating bucket 'fahras-files'...
mc.exe mb local/fahras-files --ignore-existing

REM Set bucket policy to public read
echo Setting bucket policy...
mc.exe anonymous set download local/fahras-files

echo.
echo MinIO bucket initialized successfully!
echo Bucket: fahras-files
echo Access Key: minioadmin
echo Secret Key: minioadmin123
echo Console: http://localhost:9001

REM Clean up
del mc.exe
pause
