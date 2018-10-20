// Based on:
// - https://developer.mozilla.org/en-US/docs/Web/API/Window/onbeforeinstallprompt
// - https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent

interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
}

interface BeforeInstallPromptEvent {
    /**
     * Returns an array of DOMString items containing the platforms on which the event was dispatched. This is provided for user agents that want to present a choice of versions to the user such as, for example, "web" or "play" which would allow the user to chose between a web version or an Android version.
     */
    platform: string[];

    /**
     * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
     */
    userChoice: Promise<string>;

    /**
     * Allows a developer to show the install prompt at a time of their own choosing. This method returns a  Promise.
     */
    prompt(): Promise<void>;
}
