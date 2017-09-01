import DefaultPage from './Pages/DefaultPage';
import AppContext from './AppFramework/AppContext';

export default function getPages(appContext : AppContext) {
    return [
        new DefaultPage(appContext)
    ];
}