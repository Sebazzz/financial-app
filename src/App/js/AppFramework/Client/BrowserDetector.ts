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