// Hiệu ứng lấp lánh
function createSparkleEffect() {
    const canvas = document.getElementById('sparkleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.3
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;
            p.opacity += (Math.random() * 0.02 - 0.01);

            if (p.opacity < 0.3) p.opacity = 0.3;
            if (p.opacity > 0.8) p.opacity = 0.8;

            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });
        requestAnimationFrame(animate);
    }

    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

createSparkleEffect();

function pasteFromClipboard() {
    navigator.clipboard.readText()
        .then(text => {
            document.getElementById('mediaLink').value = text;
        })
        .catch(err => {
            console.error('Không thể đọc clipboard: ', err);
            alert('Không thể dán từ clipboard. Vui lòng dán thủ công.');
        });
}

function clearInput() {
    document.getElementById('mediaLink').value = '';
    document.getElementById('player').innerHTML = '';
}

function playMedia() {
    const linkInput = document.getElementById('mediaLink').value.trim();
    const playerDiv = document.getElementById('player');
    playerDiv.innerHTML = '';

    if (!linkInput) {
        playerDiv.innerHTML = '<p style="color: #ff4b5c;">Vui lòng nhập link!</p>';
        return;
    }

    let url;
    try {
        url = new URL(linkInput);
    } catch (e) {
        playerDiv.innerHTML = '<p style="color: #ff4b5c;">Link không hợp lệ! Vui lòng kiểm tra lại.</p>';
        return;
    }

    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;
    const urlParams = new URLSearchParams(url.search);

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        let videoId = '';
        if (hostname.includes('youtu.be')) {
            videoId = pathname.split('/').pop().split('?')[0];
        } else if (pathname.includes('/watch')) {
            videoId = urlParams.get('v');
        } else if (pathname.includes('/live')) {
            videoId = pathname.split('/').pop().split('?')[0];
        } else if (pathname.includes('/embed')) {
            videoId = pathname.split('/').pop().split('?')[0];
        } else if (pathname.includes('/playlist')) {
            const playlistId = urlParams.get('list');
            if (playlistId) {
                playerDiv.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=${playlistId}" frameborder="0" allowfullscreen></iframe>`;
                return;
            }
        }
        if (videoId) {
            const timeParam = urlParams.get('t') ? `&start=${urlParams.get('t').replace('s', '')}` : '';
            playerDiv.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1${timeParam}" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
    }

    // Vimeo
    if (hostname.includes('vimeo.com')) {
        const videoId = pathname.split('/').pop();
        if (videoId) {
            playerDiv.innerHTML = `<iframe src="https://player.vimeo.com/video/${videoId}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
    }

    // SoundCloud
    if (hostname.includes('soundcloud.com')) {
        playerDiv.innerHTML = `<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(linkInput)}&color=%23ff5500&auto_play=true"></iframe>`;
        return;
    }

    // Dailymotion
    if (hostname.includes('dailymotion.com')) {
        const videoId = pathname.split('/').pop().split('_')[0];
        if (videoId) {
            playerDiv.innerHTML = `<iframe src="https://www.dailymotion.com/embed/video/${videoId}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
    }

    // Twitch
    if (hostname.includes('twitch.tv')) {
        const channel = pathname.split('/').pop();
        if (channel) {
            playerDiv.innerHTML = `<iframe src="https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
    }

    // Spotify
    if (hostname.includes('spotify.com')) {
        const type = pathname.split('/')[1];
        const id = pathname.split('/').pop();
        if (type && id) {
            playerDiv.innerHTML = `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/${type}/${id}" width="100%" height="${type === 'track' ? '80' : '380'}" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
            return;
        }
    }

    // Instagram Reels
    if (hostname.includes('instagram.com')) {
        const reelIdMatch = pathname.match(/reel\/([^\/]+)/) || pathname.match(/p\/([^\/]+)/);
        const reelId = reelIdMatch ? reelIdMatch[1] : '';
        if (reelId) {
            playerDiv.innerHTML = `<iframe src="https://www.instagram.com/reel/${reelId}/embed" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
        if (linkInput.includes('instagram.com/reel/') || linkInput.includes('instagram.com/p/')) {
            playerDiv.innerHTML = `<iframe src="${linkInput}/embed" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
        playerDiv.innerHTML = `<p style="color: #ff4b5c;">Instagram Reels cần link URL hợp lệ hoặc link embed. Truy cập Reels trên Instagram, nhấp "Share" > "Copy Link" để lấy URL dạng https://www.instagram.com/reel/VIDEO_ID/, hoặc chọn "Embed" để lấy link iframe (dạng https://www.instagram.com/reel/VIDEO_ID/embed). Nếu Reels bị hạn chế (riêng tư hoặc khu vực), nhúng có thể không hoạt động. Dán link và thử lại.</p>`;
        return;
    }

    // TikTok
    if (hostname.includes('tiktok.com')) {
        const videoIdMatch = pathname.match(/video\/(\d+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : '';
        if (videoId) {
            playerDiv.innerHTML = `<iframe src="https://www.tiktok.com/embed/v2/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
        if (linkInput.includes('tiktok.com/embed')) {
            playerDiv.innerHTML = `<iframe src="${linkInput}" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
        playerDiv.innerHTML = `<p style="color: #ff4b5c;">TikTok cần link URL hợp lệ hoặc link embed. Truy cập TikTok, nhấp "Share" trên video, chọn "Copy Link" để lấy URL dạng https://www.tiktok.com/@user/video/123456789, hoặc chọn "Copy Embed Code" để lấy link iframe (dạng https://www.tiktok.com/embed/v2/...). Dán link và thử lại.</p>`;
        return;
    }

    // Facebook Video
    if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) {
        const shortIdMatch = pathname.match(/share\/v\/([0-9a-zA-Z]+)/);
        const videoIdMatch = pathname.match(/videos\/(\d+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : shortIdMatch ? shortIdMatch[1] : urlParams.get('v');
        if (videoId) {
            const href = encodeURIComponent(linkInput);
            playerDiv.innerHTML = `<iframe src="https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&width=560" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
        if (linkInput.includes('facebook.com/plugins/video.php')) {
            playerDiv.innerHTML = `<iframe src="${linkInput}" frameborder="0" allowfullscreen></iframe>`;
            return;
        }
        playerDiv.innerHTML = `<p style="color: #ff4b5c;">Facebook cần link URL hợp lệ hoặc link embed. Truy cập video trên Facebook, nhấp "Share" > "Copy Link" để lấy URL dạng https://www.facebook.com/PAGE_ID/videos/VIDEO_ID (ví dụ: https://www.facebook.com/61551502482418/videos/648274094784873), hoặc chọn "Embed" để lấy link iframe (dạng https://www.facebook.com/plugins/video.php?href=...). Nếu dùng link ngắn (fb.watch hoặc /share/v/), truy cập link để lấy URL đầy đủ và dán lại. Video riêng tư hoặc hạn chế khu vực có thể không nhúng được.</p>`;
        return;
    }

    // Mixcloud
    if (hostname.includes('mixcloud.com')) {
        const path = pathname.replace(/^\/|\/$/g, '');
        if (path) {
            playerDiv.innerHTML = `<iframe width="100%" height="120" src="https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(linkInput)}&hide_cover=1&autoplay=1" frameborder="0"></iframe>`;
            return;
        }
    }

    // Link media trực tiếp (MP4, MP3, WebM, WAV, HLS)
    if (linkInput.match(/\.(mp4|webm)$/i)) {
        playerDiv.innerHTML = `<video id="mediaPlayer" class="video-js vjs-default-skin" controls autoplay><source src="${linkInput}" type="video/${linkInput.split('.').pop().toLowerCase()}">Trình duyệt không hỗ trợ video.</video>`;
        videojs('mediaPlayer', { fluid: true });
        return;
    }
    if (linkInput.match(/\.(mp3|wav)$/i)) {
        playerDiv.innerHTML = `<audio id="mediaPlayer" class="video-js vjs-default-skin" controls autoplay><source src="${linkInput}" type="audio/${linkInput.split('.').pop().toLowerCase()}">Trình duyệt không hỗ trợ audio.</audio>`;
        videojs('mediaPlayer', { fluid: true, height: 50 });
        return;
    }
    if (linkInput.match(/\.m3u8$/i)) {
        playerDiv.innerHTML = `<video id="mediaPlayer" class="video-js vjs-default-skin" controls autoplay><source src="${linkInput}" type="application/x-mpegURL">Trình duyệt không hỗ trợ HLS.</video>`;
        videojs('mediaPlayer', { fluid: true });
        return;
    }

    // Link không hỗ trợ
    playerDiv.innerHTML = '<p style="color: #ff4b5c;">Link không được hỗ trợ! Hãy thử YouTube, Vimeo, SoundCloud, Dailymotion, Twitch, Spotify, Mixcloud, Instagram Reels, TikTok, Facebook, MP4, MP3, hoặc HLS.</p>';
}