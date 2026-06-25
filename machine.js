function applySiteConfig() {
    const { brandName, tagline } = SITE_CONFIG;

    document.title = brandName;

    const brandIntro = document.getElementById('brandNameIntro');
    const brandHero = document.getElementById('brandNameHero');
    if (brandIntro) brandIntro.textContent = brandName;
    if (brandHero) brandHero.textContent = brandName;

    const taglineEl = document.getElementById('introTagline');
    if (taglineEl) taglineEl.textContent = tagline;
}

function getMachineFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('machine');
    return SITE_CONFIG.machines.find(m => m.id === id);
}

function buildYouTubeEmbedUrl(videoId) {
    const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1'
    });

    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        params.set('origin', window.location.origin);
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

function renderGuide(guide) {
    if (!guide) return '';

    const steps = (guide.steps || [])
        .map((step, i) => `<li>${i + 1}. ${step}</li>`)
        .join('');

    const mistakes = (guide.mistakes || [])
        .map(item => `<li>${item}</li>`)
        .join('');

    const safetyTips = (guide.safetyTips || [])
        .map(item => `<li>${item}</li>`)
        .join('');

    return `
        <article class="machine-guide" lang="ar" dir="rtl">
            <h3 class="machine-guide-title">${guide.title || ''}</h3>

            <ol class="machine-guide-steps">${steps}</ol>

            <p class="machine-guide-block">
                <strong>العضلات المستهدفة:</strong> ${guide.targetMuscles || ''}
            </p>

            <div class="machine-guide-block">
                <strong>أخطاء شائعة:</strong>
                <ul class="machine-guide-list">${mistakes}</ul>
            </div>

            <div class="machine-guide-block">
                <strong>نصائح الأمان:</strong>
                <ul class="machine-guide-list">${safetyTips}</ul>
            </div>
        </article>
    `;
}

function renderMachine(machine) {
    const container = document.getElementById('machineContent');
    if (!container) return;

    if (!machine) {
        container.innerHTML = `
            <div class="machine-not-found">
                <i class="fas fa-dumbbell"></i>
                <p>Machine not found.</p>
                <a class="btn-secondary machine-back" href="index.html">Back to machines</a>
            </div>
        `;
        return;
    }

    document.title = `${machine.title} · ${SITE_CONFIG.brandName}`;

    const isLocalFile = window.location.protocol === 'file:';
    const watchUrl = `https://www.youtube.com/watch?v=${machine.videoId}`;

    const videoMarkup = isLocalFile
        ? `
        <a class="video-fallback" href="${watchUrl}" target="_blank" rel="noopener noreferrer">
            <img
                src="https://img.youtube.com/vi/${machine.videoId}/hqdefault.jpg"
                alt="${machine.title} tutorial preview"
            >
            <span class="video-play"><i class="fas fa-play"></i> Watch tutorial</span>
        </a>`
        : `
        <iframe
            src="${buildYouTubeEmbedUrl(machine.videoId)}"
            title="${machine.title} tutorial"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
        ></iframe>`;

    container.innerHTML = `
        <h2 class="machine-title">${machine.title}</h2>

        <div class="video-wrapper">
            ${videoMarkup}
        </div>

        <div class="muscle-section">
            <h3 class="muscle-heading">Muscles Worked</h3>
            <p class="muscle-label">${machine.muscleLabel || ''}</p>
            <img
                class="muscle-image"
                src="${machine.muscleImage}"
                alt="${machine.muscleLabel || 'Muscles trained by this machine'}"
            >
        </div>

        ${renderGuide(machine.guide)}
    `;
}

function initDynamicBackground() {
    const bg = document.querySelector('.bg-orbs');
    if (!bg) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (clientX, clientY) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = (clientX - cx) / cx;
        targetY = (clientY - cy) / cy;
    };

    document.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    document.addEventListener('touchmove', (e) => {
        if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    function animate() {
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        const px = currentX * 30;
        const py = currentY * 20;
        bg.style.transform = `translate(${px}px, ${py}px) scale(1.02)`;

        requestAnimationFrame(animate);
    }

    animate();
}

document.addEventListener('DOMContentLoaded', () => {
    applySiteConfig();
    renderMachine(getMachineFromUrl());

    const introScreen = document.getElementById('introScreen');
    const revealPage = () => {
        introScreen?.classList.add('hidden');
        document.body.classList.remove('loading');
    };

    setTimeout(revealPage, 1800);
    setTimeout(revealPage, 2600);

    initDynamicBackground();
});
