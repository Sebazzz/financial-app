import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';
import NowRouteProvider from 'App/Services/NowRoute';

// Sub-folders
import SheetEntry from './SheetEntry';

// Return all
export default [
    SheetEntry,
    {
        id: 'ArchiveDefaultPage',
        routingTable: { name: 'archive', path: '/archive' },
        loadAsync: () => import('./DefaultPage')
    },
    {
        id: 'ArchiveSheetPage',
        routingTable: [
            {
                name: 'archive.sheet',
                path: '/sheet/:year<\\d{4}>/:month<\\d{1,2}>'
            },
            {
                name: 'sheet',
                path: '/sheet/:year<\\d{4}>/:month<\\d{1,2}>',
                forwardTo: 'archive.sheet'
            },
            {
                name: 'now',
                path: '/now',
                canActivate: router => {
                    return toState => {
                        if (toState.name !== 'now') {
                            // Derived route - always OK
                            return true;
                        }

                        const nowRoute = new NowRouteProvider();

                        router.cancel();
                        router.navigate('archive.sheet', nowRoute.getParams());
                        return false;
                    };
                }
            }
        ],
        loadAsync: () => import('./SheetPage')
    },
    {
        id: 'ArchiveSheetStatisticsPage',
        routingTable: [
            { name: 'archive.sheet.statistics', path: '/statistics' },
            {
                name: 'sheet.stats',
                path: '/stats',
                forwardTo: 'archive.sheet.statistics'
            }
        ],
        loadAsync: () => import('./SheetStatisticsPage')
    }
] as PageRegistrationCollection;
