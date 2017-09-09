import DefaultPage from './Pages/DefaultPage';
import AuthLoginPage from './Pages/Auth/LoginPage';
import AuthLogOffPage from './Pages/Auth/LogOffPage';
import AppContext from './AppFramework/AppContext';

export default function getPages(appContext : AppContext) {
    return [
        new DefaultPage(appContext),
        new AuthLoginPage(appContext),
        new AuthLogOffPage(appContext)
    ];
}