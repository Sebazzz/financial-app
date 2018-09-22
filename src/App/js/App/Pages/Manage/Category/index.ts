import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';

export default [
    {
        id: 'ManageCategoryDefaultPage',
        routingTable: { name: 'manage.category', path: '/category' },
        loadAsync: () => import('./DefaultPage')
    },
    {
        id: 'ManageCategoryEditPage',
        routingTable: [
            { name: 'manage.category.edit', path: '/edit/:id' },
            { name: 'manage.category.add', path: '/add' }
        ],
        loadAsync: () => import('./EditPage')
    }
] as PageRegistrationCollection;
