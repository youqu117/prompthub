@echo off
setlocal

echo Updating PromptHub Pro...
git pull

if not exist node_modules (
  echo Installing dependencies...
  npm install
) else (
  echo Dependencies already installed.
)

echo Update complete.
endlocal
