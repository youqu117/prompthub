@echo off
setlocal

echo Updating PromptHub Pro...
git pull

if not exist node_modules (
  echo Installing dependencies...
  call npm install
) else (
  echo Dependencies already installed.
)

if not exist dist\\index.html (
  echo Building app assets...
  call npm run build
)

echo Update complete.
endlocal
