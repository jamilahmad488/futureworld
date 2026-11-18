# FutureWorld GitHub Pages Workflow

## Repository

https://github.com/jamilahmad488/futureworld

## Website

https://jamilahmad488.github.io/futureworld/

## Standard Commands

git status
git add .
git commit -m "Describe update"
git push origin main

## If Push Fails Due to Large Files

git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

Then retry:

git push origin main

## Large Video Recommendation

If MP4 files are too large, upload to YouTube and embed on the website.
