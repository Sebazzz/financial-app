import AppContext from './AppFramework/AppContext';
import DefaultPage from './Pages/DefaultPage';
import ReportPage from './Pages/ReportPage';
import Archive_DefaultPage from './Pages/Archive/DefaultPage';
import Archive_SheetPage from './Pages/Archive/SheetPage';
import Archive_SheetEntry_DefaultPage from './Pages/Archive/SheetEntry/DefaultPage';
import Archive_SheetEntry_EditPage from './Pages/Archive/SheetEntry/EditPage';
import Auth_LoginPage from './Pages/Auth/LoginPage';
import Auth_LogOffPage from './Pages/Auth/LogOffPage';
import Manage_DefaultPage from './Pages/Manage/DefaultPage';
import Manage_ImpersonatePage from './Pages/Manage/ImpersonatePage';
import Manage_Category_DefaultPage from './Pages/Manage/Category/DefaultPage';
import Manage_Category_EditPage from './Pages/Manage/Category/EditPage';
import Manage_EntryTemplate_DefaultPage from './Pages/Manage/EntryTemplate/DefaultPage';
import Manage_EntryTemplate_EditPage from './Pages/Manage/EntryTemplate/EditPage';
import Manage_User_DefaultPage from './Pages/Manage/User/DefaultPage';
import Manage_User_EditPage from './Pages/Manage/User/EditPage';

export default function getPages(appContext : AppContext) {
    return [
        new DefaultPage(appContext),
        new ReportPage(appContext),
        new Archive_DefaultPage(appContext),
        new Archive_SheetPage(appContext),
        new Archive_SheetEntry_DefaultPage(appContext),
        new Archive_SheetEntry_EditPage(appContext),
        new Auth_LoginPage(appContext),
        new Auth_LogOffPage(appContext),
        new Manage_DefaultPage(appContext),
        new Manage_ImpersonatePage(appContext),
        new Manage_Category_DefaultPage(appContext),
        new Manage_Category_EditPage(appContext),
        new Manage_EntryTemplate_DefaultPage(appContext),
        new Manage_EntryTemplate_EditPage(appContext),
        new Manage_User_DefaultPage(appContext),
        new Manage_User_EditPage(appContext)
    ];
}

