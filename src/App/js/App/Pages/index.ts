import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';

// Sub-folders
import Archive from './Archive';
import Auth from './Auth';
import Manage from './Manage';
import Report from './Report';
import Setup from './Setup';

// Return all
export default [
    Archive,
    Auth,
    Manage,
    Report,
    Setup,
    {
        id: 'AboutPage',
        routingTable: { name: 'about', path: '/about' },
        loadAsync: () => import('./AboutPage'),
        bodyClassName: 'page-about'
    },
    {
        id: 'DefaultPage',
        routingTable: { name: 'default', path: '/' },
        loadAsync: () => import('./DefaultPage'),
        bodyClassName: 'page-dashboard'
    },
    {
        id: 'MyAccountPage',
        routingTable: { name: 'my-account', path: '/my-account' },
        loadAsync: () => import('./MyAccountPage')
    }
] as PageRegistrationCollection;
