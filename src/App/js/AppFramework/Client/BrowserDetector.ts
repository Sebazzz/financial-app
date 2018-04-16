let isMobile: boolean | null = null;
const detectionStrings = [
    'Windows Phone',
    'Android',
    'Mobile',
    'IEMobile'
];

function isMobileInternal(): boolean {
    const userAgent = navigator.userAgent;
    if (!userAgent) {
        return false;
    }

    if (window.matchMedia('(max-width: 768px)').matches) {
        // Bootstrap md media breakpoint
        return true;
    }

    for (const indicator of detectionStrings) {
        if (userAgent.indexOf(indicator) !== -1) {
            return true;
        }
    }

    return false;
}

export default function detectMobile() {
    if (isMobile === null) {
        isMobile = isMobileInternal();
    }

    return isMobile;
}
