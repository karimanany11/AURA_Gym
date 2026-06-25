import './NFCIcon.css';

export interface NFCIconProps {
    size?: number | string;
    className?: string;
    strokeWidth?: number;
    'aria-label'?: string;
}

export function NFCIcon({
    size = 48,
    className = '',
    strokeWidth = 3.5,
    'aria-label': ariaLabel = 'NFC',
}: NFCIconProps) {
    return (
        <svg
            className={`nfc-icon ${className}`.trim()}
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={ariaLabel}
        >
            <g transform="rotate(45 32 32)">
                <path
                    className="nfc-arc-left"
                    d="M 38 13 A 19 19 0 1 0 38 51"
                    strokeWidth={strokeWidth + 0.5}
                    pathLength={1}
                />
                <g className="nfc-dot-wrap">
                    <circle className="nfc-dot" cx="40" cy="32" r="3.5" />
                </g>
                <path
                    className="nfc-wave nfc-wave-1"
                    d="M 50 22 C 56 25.5 56 38.5 50 42"
                    strokeWidth={strokeWidth}
                    pathLength={1}
                />
                <path
                    className="nfc-wave nfc-wave-2"
                    d="M 56 16 C 64 26 64 38 56 48"
                    strokeWidth={strokeWidth}
                    pathLength={1}
                />
            </g>
        </svg>
    );
}

export default NFCIcon;
