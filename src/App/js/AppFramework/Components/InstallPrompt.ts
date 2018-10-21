import AppContext from 'AppFramework/AppContext';
import * as framework from 'AppFramework/Panel';

const clazz = 'install-prompt',
    visibleClazz = clazz + '--is-visible',
    animatingClazz = clazz + '--is-animating',
    acceptButtonClazz = clazz + '__accept-button',
    dismissButtonClazz = clazz + '__dismiss-button';

export class InstallPrompt extends framework.Panel {
    private promptFunction: (() => Promise<void>) | null = null;

    constructor(private element: HTMLElement, appContext: AppContext) {
        super(appContext);

        // Bind "this"
        this.onBeforeInstallPrompt = this.onBeforeInstallPrompt.bind(this);
        this.onInstallPromptClick = this.onInstallPromptClick.bind(this);
        this.onAppInstalled = this.onAppInstalled.bind(this);

        // We do this now because in activate we may be too late. In fact, we may be too late already
        // because of the time it takes to initialize. Still, do it ASAP, which is now.
        this.registerEvent();

        if (DEBUG) {
            (window as any).installPrompt = this;
        }
    }

    public deactivate(): void {
        this.unregisterEvent();
    }

    protected onActivate(): Promise<void> | null {
        return null;
    }

    private registerEvent() {
        window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
        window.addEventListener('appinstalled', this.onAppInstalled);
        this.element.addEventListener('click', this.onInstallPromptClick);
    }

    private unregisterEvent() {
        window.removeEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
        window.removeEventListener('appinstalled', this.onAppInstalled);
        this.element.removeEventListener('click', this.onInstallPromptClick);
    }

    private onBeforeInstallPrompt(event: BeforeInstallPromptEvent) {
        console.info('onBeforeInstallPrompt');

        this.showPrompt();
        this.promptFunction = () => event.prompt();
    }

    private onAppInstalled(event: Event) {
        alert('Financial App is nu geïnstalleerd op je startscherm. Je kan voortaan vanaf daar starten.');
    }

    private onInstallPromptClick(event: MouseEvent) {
        if (event.target && (event.target as HTMLElement).classList.contains(dismissButtonClazz)) {
            event.preventDefault();

            this.hidePrompt();
            return;
        }

        if (event.target && (event.target as HTMLElement).classList.contains(acceptButtonClazz)) {
            event.preventDefault();

            (async () => {
                const promptFn = this.promptFunction;

                if (!promptFn) {
                    alert('Installeren niet mogelijk');
                    this.hidePrompt();
                    return;
                }

                try {
                    await promptFn();
                } catch (e) {
                    console.error(e);

                    alert('Installeren niet mogelijk');
                } finally {
                    this.hidePrompt();
                }
            })();
        }
    }

    private prepareAnimation() {
        // Ensure animating class
        this.element.classList.add(animatingClazz);

        // Force layout, otherwise transition won't happen
        this.element.offsetHeight.toString();
    }

    private hidePrompt() {
        this.prepareAnimation();
        this.element.classList.remove(visibleClazz);
    }

    private showPrompt() {
        this.prepareAnimation();
        this.element.classList.add(visibleClazz);
    }
}

export default function register(appContext: AppContext) {
    framework.createPanelComponent(
        'install-prompt',
        require('~/ko-templates/widgets/install-prompt.html'),
        (_, info) => new InstallPrompt(info!.element as HTMLElement, appContext)
    );
}
