import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';

export default [
    {
        id: 'ManageUserDefaultPage',
        routingTable: { name: 'manage.user', path: '/user' },
        loadAsync: () => import('./DefaultPage')
    },
    {
        id: 'ManageUserEditPage',
        routingTable: [{ name: 'manage.user.edit', path: '/edit/:id' }, { name: 'manage.user.add', path: '/add' }],
        loadAsync: () => import('./EditPage')
    }
] as PageRegistrationCollection;
