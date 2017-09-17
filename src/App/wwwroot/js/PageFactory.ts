import DefaultPageRegistration from './Pages/DefaultPage';
import ReportPageRegistration from './Pages/ReportPage';
import Archive_DefaultPageRegistration from './Pages/Archive/DefaultPage';
import Archive_SheetPageRegistration from './Pages/Archive/SheetPage';
import Archive_SheetStatisticsPageRegistration from './Pages/Archive/SheetStatisticsPage';
import Archive_SheetEntry_DefaultPageRegistration from './Pages/Archive/SheetEntry/DefaultPage';
import Archive_SheetEntry_EditPageRegistration from './Pages/Archive/SheetEntry/EditPage';
import Auth_LoginPageRegistration from './Pages/Auth/LoginPage';
import Auth_LogOffPageRegistration from './Pages/Auth/LogOffPage';
import Manage_DefaultPageRegistration from './Pages/Manage/DefaultPage';
import Manage_ImpersonatePageRegistration from './Pages/Manage/ImpersonatePage';
import Manage_Category_DefaultPageRegistration from './Pages/Manage/Category/DefaultPage';
import Manage_Category_EditPageRegistration from './Pages/Manage/Category/EditPage';
import Manage_EntryTemplate_DefaultPageRegistration from './Pages/Manage/EntryTemplate/DefaultPage';
import Manage_EntryTemplate_EditPageRegistration from './Pages/Manage/EntryTemplate/EditPage';
import Manage_User_DefaultPageRegistration from './Pages/Manage/User/DefaultPage';
import Manage_User_EditPageRegistration from './Pages/Manage/User/EditPage';

export default function getPages() {
    return [
        DefaultPageRegistration,
        ReportPageRegistration,
        Archive_DefaultPageRegistration,
        Archive_SheetPageRegistration,
        Archive_SheetStatisticsPageRegistration,
        Archive_SheetEntry_DefaultPageRegistration,
        Archive_SheetEntry_EditPageRegistration,
        Auth_LoginPageRegistration,
        Auth_LogOffPageRegistration,
        Manage_DefaultPageRegistration,
        Manage_ImpersonatePageRegistration,
        Manage_Category_DefaultPageRegistration,
        Manage_Category_EditPageRegistration,
        Manage_EntryTemplate_DefaultPageRegistration,
        Manage_EntryTemplate_EditPageRegistration,
        Manage_User_DefaultPageRegistration,
        Manage_User_EditPageRegistration
    ];
}

