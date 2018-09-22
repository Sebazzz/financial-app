import PageRegistry from 'AppFramework/Navigation/PageRegistry';
import { IPageRepository } from 'AppFramework/AppFactory';
import pages from 'App/Pages';

export default function installPages(app: IPageRepository) {
    PageRegistry.register(app, pages);
}
