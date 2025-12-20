# Wrapp0r - Non-Tech Setup Guide

A plain-language guide for running Wrapp0r with Docker. No coding experience needed.

---

## What is Wrapp0r?

Wrapp0r turns your spreadsheet data into a Spotify Wrapped-style video presentation. Upload a file (like your fitness log, music history, or spending records), and AI will analyse it to create animated slides with interesting insights about your data. You can then export it as an MP4 video to share.

---

## What you need

- **This project folder** (a "repo") on your computer. A repo is just a folder that holds the app's files. You can download it as a ZIP from GitHub.
- **Docker Desktop** installed and running: https://www.docker.com/products/docker-desktop/
  Think of Docker as a container that bundles everything the app needs so you do not have to install tools one by one.
- **An OpenAI API key**: https://platform.openai.com/api-keys
  This is how you pay for the AI that analyses your data. You will add this key in the app's settings.
- **A web browser** (Chrome, Firefox, Safari, Edge).
- **A terminal/command prompt** (the text window where you type commands).

---

## How to open a terminal

**Mac:**
Press Command+Space, type "Terminal", press Enter.

**Windows:**
Press the Windows key, type "PowerShell" (or "Terminal" on Windows 11), press Enter.

Once it is open, you can type commands and press Enter to run them.

---

## Start the app with Docker

1. **Get the project onto your computer**
   Download the ZIP from GitHub, unzip it, and you will have a folder named `Wrapp0r`.

2. **Open a terminal and move into the docker folder**
   - Mac example: `cd ~/Downloads/Wrapp0r/docker` (adjust path if you moved it)
   - Windows example: `cd "C:\Users\YOURNAME\Downloads\Wrapp0r\docker"` (replace YOURNAME)

3. **Make sure Docker Desktop is running**
   Open Docker Desktop and leave it running in the background. You should see the whale icon in your system tray.

4. **Build the app** (first run takes a few minutes)
   ```
   docker compose build
   ```

5. **Start the app**
   ```
   docker compose up -d
   ```

6. **Open the app**
   Go to http://localhost in your web browser.

---

## Using the app

1. **Add your OpenAI API key**
   Click the settings icon (gear) and paste your API key. This is stored only in your browser.

2. **Upload a spreadsheet**
   Drop an Excel (.xlsx), CSV, or JSON file onto the upload area. The app works with fitness logs, music history, spending records, productivity stats, and more.

3. **Choose a category** (or let AI detect it)
   Select what type of data you uploaded, or let the app figure it out from your column headers.

4. **Generate your Wrapped**
   Click generate and wait for the AI to create your personalised slides. This usually takes 30-60 seconds.

5. **Preview and export**
   Navigate through your slides, then click "Export Video" to download as MP4.

---

## Stopping the app

When you are done, stop the containers:

```
docker compose down
```

To start again later, just run `docker compose up -d` from the docker folder.

---

## Notes and troubleshooting

### Port 80 already in use

If you see an error about port 80, another app is using it. Use a different port:

```
WEB_PORT=8080 docker compose up -d
```

Then open http://localhost:8080 instead.

### Video export is slow

Video rendering needs memory. Make sure Docker Desktop has at least 2GB RAM allocated (check Docker Desktop settings).

### Cannot connect to API / generation fails

Check that both containers are running:

```
docker compose ps
```

Both `wrapp0r-web` and `wrapp0r-server` should show "Up" and "healthy".

If something is wrong, check the logs:

```
docker compose logs server
```

### Need to rebuild after updates

If you download a new version of the app:

```
docker compose build --no-cache
docker compose up -d
```
