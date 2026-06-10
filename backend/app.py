# GrabIt Backend — Flask + yt-dlp
# Deploy on Render.com (free tier)
# Requirements: flask, yt-dlp, flask-cors

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import yt_dlp
import requests
import os

app = Flask(__name__)
CORS(app)  # Allow all origins — restrict to your domain in production

# ── CONFIG ──────────────────────────────────────────
YDL_OPTS_INFO = {
    'quiet': True,
    'no_warnings': True,
    'noplaylist': True,
    'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
}

ALLOWED_FORMATS = ['1080', '720', '480', '360', 'audio']

# ── HEALTH CHECK ────────────────────────────────────
@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'GrabIt backend running ✓'})

# ── GET VIDEO INFO ───────────────────────────────────
@app.route('/info', methods=['POST'])
def get_info():
    data = request.get_json()
    url  = data.get('url', '').strip()

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        with yt_dlp.YoutubeDL(YDL_OPTS_INFO) as ydl:
            info = ydl.extract_info(url, download=False)

        # Build quality options
        formats = []
        seen    = set()

        for fmt in reversed(info.get('formats', [])):
            height = fmt.get('height')
            vcodec = fmt.get('vcodec', 'none')
            acodec = fmt.get('acodec', 'none')

            # Video formats
            if height and vcodec != 'none':
                label = f'{height}p'
                if label not in seen:
                    seen.add(label)
                    formats.append({'label': label, 'url': fmt.get('url', '')})

            # Audio only
            if vcodec == 'none' and acodec != 'none' and 'audio' not in seen:
                seen.add('audio')
                formats.append({'label': 'Audio Only (MP3)', 'url': fmt.get('url', '')})

        # Fallback if no formats parsed
        if not formats:
            formats = [{'label': 'Best Quality', 'url': info.get('url', '')}]

        return jsonify({
            'title':        info.get('title', 'Video'),
            'thumbnail':    info.get('thumbnail', ''),
            'duration':     info.get('duration', 0),
            'uploader':     info.get('uploader', ''),
            'platform':     info.get('extractor_key', ''),
            'formats':      formats[:6],  # max 6 quality options
            'download_url': info.get('url', ''),
        })

    except yt_dlp.utils.DownloadError as e:
        msg = str(e)
        if 'Private' in msg or 'private' in msg:
            return jsonify({'error': 'This video is private and cannot be downloaded.'}), 403
        if 'not available' in msg.lower():
            return jsonify({'error': 'Video not available. It may have been removed.'}), 404
        return jsonify({'error': 'Could not fetch video. Check the URL and try again.'}), 400

    except Exception as e:
        return jsonify({'error': 'Unexpected error. Please try again.'}), 500


# ── PROXY DOWNLOAD ───────────────────────────────────
# Streams the video through our server so the browser can download it
@app.route('/download', methods=['POST'])
def proxy_download():
    data     = request.get_json()
    file_url = data.get('url', '').strip()

    if not file_url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer':    'https://www.youtube.com/',
        }
        r = requests.get(file_url, headers=headers, stream=True, timeout=30)
        r.raise_for_status()

        content_type = r.headers.get('Content-Type', 'video/mp4')

        def generate():
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    yield chunk

        return Response(
            generate(),
            content_type=content_type,
            headers={
                'Content-Disposition': 'attachment; filename="grabit_video.mp4"',
                'X-Content-Type-Options': 'nosniff',
            }
        )

    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Download failed. The source link may have expired.'}), 502

    except Exception as e:
        return jsonify({'error': 'Unexpected error during download.'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
      
