import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';

export default [
    {
        id: 'ReportBudgetPage',
        routingTable: [{ name: 'report.budget', path: '/budget' }, { name: 'archive.sheet.budget', path: '/budget' }],
        loadAsync: () => import('./BudgetPage')
    },
    {
        id: 'ReportDefaultPage',
        routingTable: {
            name: 'report',
            path: '/report',
            forwardTo: 'report.general'
        },
        loadAsync: () => import('./DefaultPage')
    },
    {
        id: 'ReportGeneralPage',
        routingTable: { name: 'report.general', path: '/general' },
        loadAsync: () => import('./GeneralPage')
    },
    {
        id: 'ReportTagsPage',
        routingTable: { name: 'report.tags', path: '/tags' },
        loadAsync: () => import('./TagsPage')
    }
] as PageRegistrationCollection;
