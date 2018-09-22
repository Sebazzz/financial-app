import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';

export default [
    {
        id: 'SetupDefaultPage',
        routingTable: { name: 'setup', path: '/setup' },
        loadAsync: () => import('./DefaultPage')
    }
] as PageRegistrationCollection;
