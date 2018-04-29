/* tslint:disable */
import { IPageRepository } from 'AppFramework/AppFactory';
import DefaultPageRegistration from './Pages/DefaultPage';
import AboutPageRegistration from './Pages/AboutPage';
import MyAccountPageRegistration from './Pages/MyAccountPage';
import Archive_DefaultPageRegistration from './Pages/Archive/DefaultPage';
import Archive_SheetPageRegistration from './Pages/Archive/SheetPage';
import Archive_SheetStatisticsPageRegistration from './Pages/Archive/SheetStatisticsPage';
import Archive_SheetEntry_DefaultPageRegistration from './Pages/Archive/SheetEntry/DefaultPage';
import Archive_SheetEntry_EditPageRegistration from './Pages/Archive/SheetEntry/EditPage';
import Auth_ConfirmEmailPageRegistration from './Pages/Auth/ConfirmEmailPage';
import Auth_ForgotPasswordPageRegistration from './Pages/Auth/ForgotPasswordPage';
import Auth_LoginPageRegistration from './Pages/Auth/LoginPage';
import Auth_LogOffPageRegistration from './Pages/Auth/LogOffPage';
import Auth_ResetPasswordPageRegistration from './Pages/Auth/ResetPasswordPage';
import Manage_DefaultPageRegistration from './Pages/Manage/DefaultPage';
import Manage_ImpersonatePageRegistration from './Pages/Manage/ImpersonatePage';
import Manage_Category_DefaultPageRegistration from './Pages/Manage/Category/DefaultPage';
import Manage_Category_EditPageRegistration from './Pages/Manage/Category/EditPage';
import Manage_EntryTemplate_DefaultPageRegistration from './Pages/Manage/EntryTemplate/DefaultPage';
import Manage_EntryTemplate_EditPageRegistration from './Pages/Manage/EntryTemplate/EditPage';
import Manage_Tag_DefaultPageRegistration from './Pages/Manage/Tag/DefaultPage';
import Manage_Tag_EditPageRegistration from './Pages/Manage/Tag/EditPage';
import Manage_User_DefaultPageRegistration from './Pages/Manage/User/DefaultPage';
import Manage_User_EditPageRegistration from './Pages/Manage/User/EditPage';
import Report_DefaultPageRegistration from './Pages/Report/DefaultPage';
import Report_BudgetPageRegistration from './Pages/Report/BudgetPage';
import Report_GeneralPageRegistration from './Pages/Report/GeneralPage';
import Report_TagsPageRegistration from './Pages/Report/TagsPage';
import Setup_DefaultRegistration from './Pages/Setup/Default';

const pageFactory = {
    replacePages(repository: IPageRepository): void {
        repository.replacePage(require('./Pages/DefaultPage').default);
        repository.replacePage(require('./Pages/AboutPage').default);
        repository.replacePage(require('./Pages/MyAccountPage').default);
        repository.replacePage(require('./Pages/Archive/DefaultPage').default);
        repository.replacePage(require('./Pages/Archive/SheetPage').default);
        repository.replacePage(require('./Pages/Archive/SheetStatisticsPage').default);
        repository.replacePage(require('./Pages/Archive/SheetEntry/DefaultPage').default);
        repository.replacePage(require('./Pages/Archive/SheetEntry/EditPage').default);
        repository.replacePage(require('./Pages/Auth/ConfirmEmailPage').default);
        repository.replacePage(require('./Pages/Auth/ForgotPasswordPage').default);
        repository.replacePage(require('./Pages/Auth/LoginPage').default);
        repository.replacePage(require('./Pages/Auth/LogOffPage').default);
        repository.replacePage(require('./Pages/Auth/ResetPasswordPage').default);
        repository.replacePage(require('./Pages/Manage/DefaultPage').default);
        repository.replacePage(require('./Pages/Manage/ImpersonatePage').default);
        repository.replacePage(require('./Pages/Manage/Category/DefaultPage').default);
        repository.replacePage(require('./Pages/Manage/Category/EditPage').default);
        repository.replacePage(require('./Pages/Manage/EntryTemplate/DefaultPage').default);
        repository.replacePage(require('./Pages/Manage/EntryTemplate/EditPage').default);
        repository.replacePage(require('./Pages/Manage/Tag/DefaultPage').default);
        repository.replacePage(require('./Pages/Manage/Tag/EditPage').default);
        repository.replacePage(require('./Pages/Manage/User/DefaultPage').default);
        repository.replacePage(require('./Pages/Manage/User/EditPage').default);
        repository.replacePage(require('./Pages/Report/DefaultPage').default);
        repository.replacePage(require('./Pages/Report/BudgetPage').default);
        repository.replacePage(require('./Pages/Report/GeneralPage').default);
        repository.replacePage(require('./Pages/Report/TagsPage').default);
        repository.replacePage(require('./Pages/Setup/Default').default);
    },

    installPages(repository: IPageRepository): void {
        const pages = [
            DefaultPageRegistration,
            AboutPageRegistration,
            MyAccountPageRegistration,
            Archive_DefaultPageRegistration,
            Archive_SheetPageRegistration,
            Archive_SheetStatisticsPageRegistration,
            Archive_SheetEntry_DefaultPageRegistration,
            Archive_SheetEntry_EditPageRegistration,
            Auth_ConfirmEmailPageRegistration,
            Auth_ForgotPasswordPageRegistration,
            Auth_LoginPageRegistration,
            Auth_LogOffPageRegistration,
            Auth_ResetPasswordPageRegistration,
            Manage_DefaultPageRegistration,
            Manage_ImpersonatePageRegistration,
            Manage_Category_DefaultPageRegistration,
            Manage_Category_EditPageRegistration,
            Manage_EntryTemplate_DefaultPageRegistration,
            Manage_EntryTemplate_EditPageRegistration,
            Manage_Tag_DefaultPageRegistration,
            Manage_Tag_EditPageRegistration,
            Manage_User_DefaultPageRegistration,
            Manage_User_EditPageRegistration,
            Report_DefaultPageRegistration,
            Report_BudgetPageRegistration,
            Report_GeneralPageRegistration,
            Report_TagsPageRegistration,
            Setup_DefaultRegistration
        ];

        repository.addPages(pages);
    }
};

export default pageFactory;
