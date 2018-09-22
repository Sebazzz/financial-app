import { IPageRepository } from 'AppFramework/AppFactory';
import { PageRegistrationCollection, PageRegistration } from 'AppFramework/Navigation/Page';
import HotModulePageModule from 'AppFramework/Navigation/HotModulePage';

// Each element in pages can recursively contain page registrations or the type itself
function walkPageRegistrationArray(
    pagesOrPageRegistrations: PageRegistrationCollection,
    destination: PageRegistration[]
) {
    for (const element of pagesOrPageRegistrations) {
        if (Array.isArray(element)) {
            // Element contains page registrations, recurse through
            walkPageRegistrationArray(element, destination);
        } else {
            destination.push(element);
        }
    }
}

let hotModulePageInstalled = false;
function installHotModulePage(destination: PageRegistration[]) {
    if (hotModulePageInstalled || !DEBUG) {
        return;
    }

    hotModulePageInstalled = true;

    const hotModulePageRegistration: PageRegistration = {
        id: 'HotModulePage',
        routingTable: { name: 'hmr-proxy', path: '/hmr-proxy' },
        loadAsync: () => Promise.resolve({ default: HotModulePageModule })
    };
    destination.push(hotModulePageRegistration);
}

export default class PageRegistry {
    public static register(repository: IPageRepository, pages: PageRegistrationCollection) {
        const allPages: PageRegistration[] = [];

        installHotModulePage(allPages);
        walkPageRegistrationArray(pages, allPages);

        repository.addPages(allPages);
    }

    public static hotReload(repository: IPageRepository, pages: PageRegistrationCollection) {
        const allPages: PageRegistration[] = [];
        walkPageRegistrationArray(pages, allPages);

        for (const page of allPages) {
            repository.replacePage(page);
        }
    }
}
