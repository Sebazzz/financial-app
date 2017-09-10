import AppContext from './AppFramework/AppContext';
import DefaultPage from './Pages/DefaultPage';
import Auth_LoginPage from './Pages/Auth/LoginPage';
import Auth_LogOffPage from './Pages/Auth/LogOffPage';
import Manage_DefaultPage from './Pages/Manage/DefaultPage';

export default function getPages(appContext : AppContext) {
    return [
        new DefaultPage(appContext),
        new Auth_LoginPage(appContext),
        new Auth_LogOffPage(appContext),
        new Manage_DefaultPage(appContext)
    ];
}

