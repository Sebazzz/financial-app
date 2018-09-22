import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';

export default [
    {
        id: 'ManageTagDefaultPage',
        routingTable: { name: 'manage.tag', path: '/tag' },
        loadAsync: () => import('./DefaultPage')
    },
    {
        id: 'ManageTagEditPage',
        routingTable: [{ name: 'manage.tag.edit', path: '/edit/:id' }, { name: 'manage.tag.add', path: '/add' }],
        loadAsync: () => import('./EditPage')
    }
] as PageRegistrationCollection;
