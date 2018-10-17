const detectionStrings = ['Windows Phone', 'Android', 'Mobile', 'IEMobile'];
let mobileQueryMatch: MediaQueryList | null = null;

function isMobileInternal(): boolean {
    const userAgent = navigator.userAgent;
    if (!userAgent || !window.matchMedia) {
        return false;
    }

    if (!mobileQueryMatch) {
        mobileQueryMatch = window.matchMedia('(max-width: 768px)');
    }

    if (mobileQueryMatch.matches) {
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

function getMobileQueryMatch() {
    isMobileInternal();

    if (!mobileQueryMatch) {
        throw new Error('mobileQueryMatch is null');
    }

    return mobileQueryMatch;
}

export type MediaQueryListListener = ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
export function addResponsiveListener(listener: MediaQueryListListener) {
    const matcher = getMobileQueryMatch();

    matcher.addListener(listener);
}

export function removeResponsiveListener(listener: MediaQueryListListener) {
    const matcher = getMobileQueryMatch();

    matcher.addListener(listener);
}

export default function detectMobile() {
    return isMobileInternal();
}
