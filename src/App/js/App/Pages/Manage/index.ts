import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';

// Sub-folders
import Category from './Category';
import EntryTemplate from './EntryTemplate';
import Tag from './Tag';
import User from './User';

// Return all
export default [
    Category,
    EntryTemplate,
    Tag,
    User,
    {
        id: 'ManageDefaultPage',
        routingTable: { name: 'manage', path: '/manage', forwardTo: 'default' },
        loadAsync: () => import('./DefaultPage')
    },
    {
        id: 'ManageImpersonatePage',
        routingTable: { name: 'manage.impersonate', path: '/impersonate' },
        loadAsync: () => import('./ImpersonatePage'),
        bodyClassName: 'page-impersonate'
    }
] as PageRegistrationCollection;
