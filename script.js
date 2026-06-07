// 1. Hardware Accelerated FPS Counter
const fpsElement = document.getElementById('fps-counter');
let frameCount = 0;
let lastFpsTime = performance.now();

function monitorFPS() {
    const now = performance.now();
    frameCount++;
    if (now - lastFpsTime >= 1000) {
        fpsElement.textContent = `${frameCount} FPS`;
        frameCount = 0;
        lastFpsTime = now;
    }
    requestAnimationFrame(monitorFPS);
}
requestAnimationFrame(monitorFPS);

// Settings Application
function applySettings() {
    const ratio = document.getElementById('custom-ratio').value;
    const boundary = document.getElementById('capture-boundary');
    try {
        boundary.style.aspectRatio = ratio;
    } catch (e) {
        console.error("Invalid aspect ratio");
    }
}

// 2. SVG Resources
const icons = {
    ytLikeOut: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`,
    ytLikeFill: `<svg class="icon-pop" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`,
    ytBellOut: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    ytBellFill: `<svg class="icon-bell-ring" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    
    fbLikeOut: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`,
    fbLikeFill: `<svg class="icon-pop" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`,
    fbShareOut: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5v4c-7 0-11 3-12 10 2.5-4 6-5 12-5v4l8-6-8-7z"/></svg>`,
    fbShareFill: `<svg class="icon-pop" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 5v4c-7 0-11 3-12 10 2.5-4 6-5 12-5v4l8-6-8-7z"/></svg>`
};

// Initialize default DOM SVGs
document.getElementById('yt-like').innerHTML = icons.ytLikeOut;
document.getElementById('yt-bell').innerHTML = icons.ytBellOut;
document.getElementById('fb-like').innerHTML = icons.fbLikeOut;
document.getElementById('fb-share').innerHTML = icons.fbShareOut;

// 3. State & Timing Engine
const cursor = document.getElementById('virtual-cursor');
let activeSequenceIds = [];
let sequenceTimers = new Set();

function delay(ms) {
    return new Promise(resolve => {
        const t = setTimeout(() => {
            sequenceTimers.delete(t);
            resolve();
        }, ms);
        sequenceTimers.add(t);
    });
}

function switchCard(type) {
    if(type === 'yt') {
        document.getElementById('card-yt').classList.remove('hidden');
        document.getElementById('card-fb').classList.add('hidden');
    } else {
        document.getElementById('card-fb').classList.remove('hidden');
        document.getElementById('card-yt').classList.add('hidden');
    }
}

function previewEngine(platformType) {
    resetEngine(); 
    switchCard(platformType);
    const seqId = Date.now();
    activeSequenceIds.push(seqId);
    
    const run = async () => {
        resetPlatform(platformType);
        cursor.style.transition = 'none';
        cursor.style.transform = `translate3d(110vw, 110vh, 0) scale(1)`;
        void cursor.offsetWidth;
        await runCursorSequence(platformType, seqId);
    };
    run();
}

function resetEngine() {
    activeSequenceIds = []; 
    sequenceTimers.forEach(clearTimeout);
    sequenceTimers.clear();
    
    resetPlatform('yt');
    resetPlatform('fb');

    cursor.style.transition = 'none';
    cursor.style.transform = `translate3d(110vw, 110vh, 0) scale(1)`;
    void cursor.offsetWidth; 
}

function resetPlatform(type) {
    if (type === 'yt') {
        const like = document.getElementById('yt-like');
        like.className = 'icon-btn';
        like.innerHTML = icons.ytLikeOut;
        
        const sub = document.getElementById('yt-sub');
        sub.className = 'action-btn btn-yt';
        sub.innerHTML = 'SUBSCRIBE';
        
        const bell = document.getElementById('yt-bell');
        bell.className = 'icon-btn';
        bell.innerHTML = icons.ytBellOut;
    } else {
        const like = document.getElementById('fb-like');
        like.className = 'icon-btn';
        like.innerHTML = icons.fbLikeOut;
        
        const follow = document.getElementById('fb-follow');
        follow.className = 'action-btn btn-fb';
        follow.innerHTML = 'FOLLOW';
        
        const share = document.getElementById('fb-share');
        share.className = 'icon-btn';
        share.innerHTML = icons.fbShareOut;
    }
}

function activateElement(id) {
    const el = document.getElementById(id);
    if(!el) return;
    
    if (id === 'yt-like') {
        el.classList.add('yt-active');
        el.innerHTML = icons.ytLikeFill;
    } else if (id === 'yt-sub') {
        el.classList.add('active');
        el.innerHTML = 'SUBSCRIBED';
    } else if (id === 'yt-bell') {
        el.classList.add('yt-active');
        el.innerHTML = icons.ytBellFill;
    } else if (id === 'fb-like') {
        el.classList.add('fb-active');
        el.innerHTML = icons.fbLikeFill;
    } else if (id === 'fb-follow') {
        el.classList.add('active');
        el.innerHTML = 'FOLLOWING';
    } else if (id === 'fb-share') {
        el.classList.add('fb-active');
        el.innerHTML = icons.fbShareFill;
    }
}

async function clickTarget(targetId, seqId) {
    if (!activeSequenceIds.includes(seqId)) return;
    const btn = document.getElementById(targetId);
    const rect = btn.getBoundingClientRect();
    
    const targetX = rect.left + rect.width / 2 - 6;
    const targetY = rect.top + rect.height / 2 - 4;
    
    cursor.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    cursor.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(1)`;
    
    await delay(400);
    if (!activeSequenceIds.includes(seqId)) return;
    
    cursor.style.transition = 'transform 0.1s ease-out';
    cursor.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(0.85)`;
    
    await delay(100);
    if (!activeSequenceIds.includes(seqId)) return;
    
    cursor.style.transition = 'transform 0.15s ease-in';
    cursor.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(1)`;
    activateElement(targetId);
    
    await delay(150);
}

async function runCursorSequence(type, seqId) {
    const exitX = window.innerWidth + 50;
    const exitY = window.innerHeight + 50;
    
    if (type === 'yt') {
        await clickTarget('yt-like', seqId);
        await delay(200);
        await clickTarget('yt-sub', seqId);
        await delay(200);
        await clickTarget('yt-bell', seqId);
    } else {
        await clickTarget('fb-like', seqId);
        await delay(200);
        await clickTarget('fb-follow', seqId);
        await delay(200);
        await clickTarget('fb-share', seqId);
    }
    
    if (!activeSequenceIds.includes(seqId)) return;
    
    await delay(300);
    cursor.style.transition = 'transform 0.5s cubic-bezier(0.5, 0, 0.75, 0)';
    cursor.style.transform = `translate3d(${exitX}px, ${exitY}px, 0) scale(1)`;
    await delay(500); 
}

// 4. Internal Canvas Rendering & MediaRecorder Engine
let mediaRecorder;
let recordedChunks = [];
let isRecordingCanvas = false;

// Video State Variables
let finalVideoUrl = "";
let finalVideoExt = "";
let finalVideoType = "";

async function startAutomatedRecording(type) {
    try {
        const reqWidth = parseInt(document.getElementById('res-width').value) || 3840;
        const reqHeight = parseInt(document.getElementById('res-height').value) || 2160;
        const reqFps = parseInt(document.getElementById('custom-fps').value) || 60;
        const formatSelect = document.getElementById('video-format').value;

        // Hide UI elements to keep clean Green Screen and lock pointer events
        document.getElementById('control-bar').style.opacity = '0';
        document.getElementById('control-bar').style.pointerEvents = 'none';
        document.getElementById('settings-panel').style.opacity = '0';
        document.getElementById('settings-panel').style.pointerEvents = 'none';
        document.getElementById('fps-counter').style.opacity = '0';

        // Prepare Hidden Render Canvas
        let renderCanvas = document.getElementById('render-canvas');
        if (!renderCanvas) {
            renderCanvas = document.createElement('canvas');
            renderCanvas.id = 'render-canvas';
            renderCanvas.style.display = 'none';
            document.body.appendChild(renderCanvas);
        }
        renderCanvas.width = reqWidth;
        renderCanvas.height = reqHeight;
        const ctx = renderCanvas.getContext('2d');

        // Dynamic Video Format Setup with Fallback logic
        let mimeType = '';
        let fileExt = '';

        if (formatSelect === 'mp4') {
            if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
                mimeType = 'video/mp4;codecs=h264';
                fileExt = 'mp4';
            } else {
                console.warn("MP4 natively unsupported by this browser. Falling back to optimal WebM.");
                mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
                fileExt = 'webm';
            }
        } else {
            mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm');
            fileExt = 'webm';
        }

        const options = { mimeType: mimeType, videoBitsPerSecond: 100000000 };

        // Setup Capture Stream
        const stream = renderCanvas.captureStream(reqFps);
        mediaRecorder = new MediaRecorder(stream, options);
        recordedChunks = [];

        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: options.mimeType });
            finalVideoUrl = URL.createObjectURL(blob);
            finalVideoExt = fileExt;
            finalVideoType = type;

            // Restore UI Elements Post-Recording
            document.getElementById('control-bar').style.opacity = '1';
            document.getElementById('control-bar').style.pointerEvents = 'auto';
            document.getElementById('settings-panel').style.opacity = '1';
            document.getElementById('settings-panel').style.pointerEvents = 'auto';
            document.getElementById('fps-counter').style.opacity = '1';
            
            // Show post-recording modal instead of downloading immediately
            document.getElementById('post-record-modal').classList.add('active');
        };

        resetEngine();
        switchCard(type);

        mediaRecorder.start();
        isRecordingCanvas = false; // Prevent race conditions
        await delay(50); // Short tick to ensure UI changes apply
        isRecordingCanvas = true;

        const targetElement = document.getElementById('render-target');

        // Frame Capture Loop (DOM to Canvas) optimized via center-crop and constrained target
        const captureFrame = async () => {
            if (!isRecordingCanvas) return;
            try {
                // Calculate scale required to perfectly cover requested dimensions (prevents stretching)
                const sourceWidth = targetElement.offsetWidth;
                const sourceHeight = targetElement.offsetHeight;
                const scaleRequired = Math.max(reqWidth / sourceWidth, reqHeight / sourceHeight);

                // Capturing ONLY the specific render target div eliminates lag
                const tempCanvas = await html2canvas(targetElement, {
                    width: sourceWidth,
                    height: sourceHeight,
                    scale: scaleRequired, 
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#00B140'
                });

                // "Center-Crop" Drawing Math
                const drawX = (reqWidth - tempCanvas.width) / 2;
                const drawY = (reqHeight - tempCanvas.height) / 2;

                // Clear & fill fallback green, then draw the perfectly scaled crop
                ctx.clearRect(0, 0, reqWidth, reqHeight);
                ctx.fillStyle = '#00B140';
                ctx.fillRect(0, 0, reqWidth, reqHeight);
                ctx.drawImage(tempCanvas, drawX, drawY);

            } catch (err) {
                console.error("Frame capture error:", err);
            }
            
            if (isRecordingCanvas) {
                requestAnimationFrame(captureFrame);
            }
        };

        // Kickstart Background Canvas Render
        captureFrame();

        // 1 Second Pre-Roll Buffer
        await delay(1000);

        // Start Sequence
        const seqId = Date.now();
        activeSequenceIds.push(seqId);
        await runCursorSequence(type, seqId);

        // 1 Second Post-Roll Buffer
        await delay(1000);

        // Stop Recording automatically
        isRecordingCanvas = false;
        mediaRecorder.stop();

    } catch (err) {
        console.error("Internal recording failed: ", err);
        alert("An error occurred during internal recording setup.");
        // Restore UI on failure
        document.getElementById('control-bar').style.opacity = '1';
        document.getElementById('control-bar').style.pointerEvents = 'auto';
        document.getElementById('settings-panel').style.opacity = '1';
        document.getElementById('settings-panel').style.pointerEvents = 'auto';
        document.getElementById('fps-counter').style.opacity = '1';
    }
}

// Post-Recording Custom Modal Logics
function closeModal() {
    document.getElementById('post-record-modal').classList.remove('active');
}

function downloadRecordedVideo() {
    if (finalVideoUrl) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = finalVideoUrl;
        a.download = `TZERONE_4K_HDR_${finalVideoType.toUpperCase()}.${finalVideoExt}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Cleanup URL and auto-close modal 
        setTimeout(() => {
            closeModal();
            URL.revokeObjectURL(finalVideoUrl);
            finalVideoUrl = "";
        }, 500);
    }
}
