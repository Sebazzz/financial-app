import { State } from 'router5';
import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';
import NowRouteProvider from 'App/Services/NowRoute';

export default [
    {
        id: 'ArchiveSheetEntryDefaultPage',
        routingTable: [
            {
                name: 'sheet.entry',
                path: '/entry',
                forwardTo: 'archive.sheet.entry'
            },
            {
                name: 'archive.sheet.entry',
                path: '/entry',
                forwardTo: 'archive.sheet'
            }
        ],
        loadAsync: () => import('./DefaultPage')
    },
    {
        id: 'ArchiveSheetEntryEditPage',
        routingTable: [
            {
                name: 'sheet.entry.add',
                path: '/add',
                forwardTo: 'archive.sheet.entry.add'
            },
            {
                name: 'sheet.entry.edit',
                path: '/edit/:id',
                forwardTo: 'archive.sheet.entry.edit'
            },

            { name: 'archive.sheet.entry.edit', path: '/edit/:id' },
            { name: 'archive.sheet.entry.add', path: '/add' },
            {
                name: 'now.add',
                path: '/add',
                canActivate: router => {
                    return (toState: State) => {
                        if (toState.name !== 'now.add') {
                            // Derived route - always OK
                            return true;
                        }

                        const nowRoute = new NowRouteProvider();

                        router.cancel();
                        router.navigate('archive.sheet.entry.add', nowRoute.getParams());
                        return false;
                    };
                }
            }
        ],
        loadAsync: () => import('./EditPage')
    }
] as PageRegistrationCollection;
