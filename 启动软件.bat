@echo off
setlocal

rem Ensure dependencies are installed before launching.
if not exist node_modules (
  echo Installing dependencies...
  npm install
)

echo Starting PromptHub Pro...
npm run start

endlocal
