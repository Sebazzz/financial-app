if (/Android/.test(navigator.appVersion)) {
    window.addEventListener('resize', () => {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
            window.setTimeout(() => {
                if (document.activeElement) {
                    try {
                        (document.activeElement as any).scrollIntoViewIfNeeded();
                    } catch (e) {
                        // ignored
                    }
                }
            }, 0);
        }
    });
}
