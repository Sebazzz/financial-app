import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';

export default [
    {
        id: 'ManageEntryTemplateDefaultPage',
        routingTable: { name: 'manage.entry-template', path: '/entry-template' },
        loadAsync: () => import('./DefaultPage')
    },
    {
        id: 'ManageEntryTemplateEditPage',
        routingTable: [
            { name: 'manage.entry-template.edit', path: '/edit/:id' },
            { name: 'manage.entry-template.add', path: '/add' }
        ],
        loadAsync: () => import('./EditPage')
    }
] as PageRegistrationCollection;
