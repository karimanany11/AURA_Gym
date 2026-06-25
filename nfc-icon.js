function nfcIconSVG() {
    return `
        <svg class="nfc-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="NFC">
            <g transform="rotate(45 32 32)">
                <path class="nfc-arc-left" d="M 38 13 A 19 19 0 1 0 38 51" stroke="currentColor" stroke-width="4" stroke-linecap="round" pathLength="1"/>
                <g class="nfc-dot-wrap">
                    <circle class="nfc-dot" cx="40" cy="32" r="3.5"/>
                </g>
                <path class="nfc-wave nfc-wave-1" d="M 50 22 C 56 25.5 56 38.5 50 42" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" pathLength="1"/>
                <path class="nfc-wave nfc-wave-2" d="M 56 16 C 64 26 64 38 56 48" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" pathLength="1"/>
            </g>
        </svg>
    `;
}

function mountNFCIcons() {
    document.querySelectorAll('[data-nfc-icon]').forEach((el) => {
        el.innerHTML = nfcIconSVG();
        el.setAttribute('aria-hidden', el.closest('a, button') ? 'true' : 'false');
    });
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', mountNFCIcons);
}
