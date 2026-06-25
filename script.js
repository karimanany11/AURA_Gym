const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getStorageKey() {
    const slug = (SITE_CONFIG.brandName || 'site').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${slug}Timetable`;
}

let timetable = loadTimetable();
let editingDay = new Date().getDay();
let editDraft = [];

function getMachines() {
    return SITE_CONFIG.machines || [];
}

function applySiteConfig() {
    const { brandName, tagline, heroSub } = SITE_CONFIG;

    document.title = brandName;

    const brandIntro = document.getElementById('brandNameIntro');
    const brandHero = document.getElementById('brandNameHero');
    if (brandIntro) brandIntro.textContent = brandName;
    if (brandHero) brandHero.textContent = brandName;

    const taglineEl = document.getElementById('introTagline');
    if (taglineEl) taglineEl.textContent = tagline;

    const heroSubEl = document.getElementById('heroSub');
    if (heroSubEl) heroSubEl.textContent = heroSub || '';
}

function loadTimetable() {
    try {
        const saved = localStorage.getItem(getStorageKey());
        if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {};
}

function saveTimetable() {
    localStorage.setItem(getStorageKey(), JSON.stringify(timetable));
}

function getDayKey(dayIndex) {
    return DAYS[dayIndex].toLowerCase();
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function newId() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyCourse() {
    return {
        id: newId(),
        courseName: '',
        courseCode: '',
        lecPlace: '',
        tutPlace: '',
        lecTime: '',
        tutTime: ''
    };
}

function renderMachines() {
    const container = document.getElementById('machinesContainer');
    if (!container) return;

    container.innerHTML = '';

    getMachines().forEach((machine, i) => {
        const el = document.createElement('a');
        el.className = `link-btn link-item link-${machine.color || 'dark'}`;
        el.style.animationDelay = `${0.08 + i * 0.07}s`;
        el.href = `machine.html?machine=${encodeURIComponent(machine.id)}`;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';

        el.innerHTML = `
            <span class="link-icon"><i class="${machine.icon}"></i></span>
            <span class="link-text">${machine.title}</span>
            <span class="link-arrow"><i class="fas fa-chevron-right"></i></span>
        `;
        container.appendChild(el);
    });
}

function renderCourseCard(course, { editable = false } = {}) {
    if (editable) {
        return `
            <div class="course-edit-card" data-id="${course.id}">
                <div class="form-row">
                    <label>Course Name</label>
                    <input type="text" data-field="courseName" value="${esc(course.courseName)}" placeholder="e.g. Data Structures">
                </div>
                <div class="form-row">
                    <label>Course Code</label>
                    <input type="text" data-field="courseCode" value="${esc(course.courseCode)}" placeholder="e.g. CS201">
                </div>
                <div class="form-grid">
                    <div class="form-row">
                        <label>Lecture Place</label>
                        <input type="text" data-field="lecPlace" value="${esc(course.lecPlace)}" placeholder="Hall A">
                    </div>
                    <div class="form-row">
                        <label>Tutorial Place</label>
                        <input type="text" data-field="tutPlace" value="${esc(course.tutPlace)}" placeholder="Room 201">
                    </div>
                    <div class="form-row">
                        <label>Lecture Time</label>
                        <input type="time" data-field="lecTime" value="${esc(course.lecTime)}">
                    </div>
                    <div class="form-row">
                        <label>Tutorial Time</label>
                        <input type="time" data-field="tutTime" value="${esc(course.tutTime)}">
                    </div>
                </div>
                <button type="button" class="btn-delete" data-delete="${course.id}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
    }

    return `
        <article class="course-card">
            <div class="course-header">
                <h3>${esc(course.courseName) || 'Unnamed Course'}</h3>
                <span class="course-code">${esc(course.courseCode) || '—'}</span>
            </div>
            <div class="course-details">
                <div class="detail-row">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <div>
                        <span class="detail-label">Lecture</span>
                        <span class="detail-value">${esc(course.lecPlace) || '—'} · ${formatTime(course.lecTime)}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <i class="fas fa-users"></i>
                    <div>
                        <span class="detail-label">Tutorial</span>
                        <span class="detail-value">${esc(course.tutPlace) || '—'} · ${formatTime(course.tutTime)}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function formatTime(time) {
    if (!time) return '—';
    const [h, m] = time.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

function renderTodayTimetable() {
    const now = new Date();
    const dayKey = getDayKey(now.getDay());
    const courses = timetable[dayKey] || [];

    document.getElementById('todayDate').textContent = formatDate(now);
    document.getElementById('todayDay').textContent = DAYS[now.getDay()];

    const container = document.getElementById('todayCourses');
    if (!courses.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-mug-hot"></i>
                <p>No classes today!</p>
                <span>Tap "Edit Timetable" to add your schedule.</span>
            </div>
        `;
        return;
    }

    const sorted = [...courses].sort((a, b) => {
        const ta = a.lecTime || a.tutTime || '99:99';
        const tb = b.lecTime || b.tutTime || '99:99';
        return ta.localeCompare(tb);
    });

    container.innerHTML = sorted.map(c => renderCourseCard(c)).join('');
}

function renderDayTabs() {
    const tabs = document.getElementById('dayTabs');
    tabs.innerHTML = DAYS.map((day, i) => `
        <button type="button" class="day-tab ${i === editingDay ? 'active' : ''}" data-day="${i}">
            ${day.slice(0, 3)}
        </button>
    `).join('');

    tabs.querySelectorAll('.day-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            syncEditDraft();
            editingDay = +btn.dataset.day;
            renderDayTabs();
            renderEditCourses();
        });
    });
}

function renderEditCourses() {
    const container = document.getElementById('editCourses');
    if (!editDraft.length) {
        container.innerHTML = `<p class="edit-empty">No courses for ${DAYS[editingDay]}. Tap "Add Course" below.</p>`;
        return;
    }
    container.innerHTML = editDraft.map(c => renderCourseCard(c, { editable: true })).join('');

    container.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
            editDraft = editDraft.filter(c => c.id !== btn.dataset.delete);
            renderEditCourses();
        });
    });
}

function syncEditDraft() {
    const cards = document.querySelectorAll('.course-edit-card');
    cards.forEach(card => {
        const id = card.dataset.id;
        const course = editDraft.find(c => c.id === id);
        if (!course) return;
        card.querySelectorAll('[data-field]').forEach(input => {
            course[input.dataset.field] = input.value;
        });
    });
}

function openTimetable() {
    renderTodayTimetable();
    showView('timetableView');
    const modal = document.getElementById('timetableModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeTimetable() {
    const modal = document.getElementById('timetableModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    showView('timetableView');
}

function showView(viewId) {
    document.getElementById('timetableView').classList.toggle('hidden', viewId !== 'timetableView');
    document.getElementById('timetableEdit').classList.toggle('hidden', viewId !== 'timetableEdit');
}

function startEdit() {
    const dayKey = getDayKey(editingDay);
    editDraft = (timetable[dayKey] || []).map(c => ({ ...c }));
    renderDayTabs();
    renderEditCourses();
    showView('timetableEdit');
}

function saveEdit() {
    syncEditDraft();
    const dayKey = getDayKey(editingDay);
    timetable[dayKey] = editDraft.filter(c =>
        c.courseName || c.courseCode || c.lecPlace || c.tutPlace || c.lecTime || c.tutTime
    );
    saveTimetable();
    renderTodayTimetable();
    showView('timetableView');
}

document.addEventListener('DOMContentLoaded', () => {
    applySiteConfig();

    const introScreen = document.getElementById('introScreen');

    const revealPage = () => {
        introScreen?.classList.add('hidden');
        document.body.classList.remove('loading');
    };

    renderMachines();

    document.getElementById('editTimetableBtn')?.addEventListener('click', startEdit);
    document.getElementById('addCourseBtn')?.addEventListener('click', () => {
        syncEditDraft();
        editDraft.push(emptyCourse());
        renderEditCourses();
    });
    document.getElementById('saveTimetableBtn')?.addEventListener('click', saveEdit);
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
        showView('timetableView');
    });

    document.querySelectorAll('[data-close="timetableModal"]').forEach(el => {
        el.addEventListener('click', closeTimetable);
    });

    setTimeout(revealPage, 1800);
    setTimeout(revealPage, 2600);

    initDynamicBackground();
});

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
