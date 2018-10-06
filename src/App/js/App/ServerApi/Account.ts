import { IPreferencesModel as IFrameworkPreferencesModel } from 'AppFramework/ServerApi/Account';

export interface IPreferencesModel extends IFrameworkPreferencesModel {
    enableMonthlyDigest: boolean;
    enableLoginNotifications: boolean;
    goToHomePageAfterContextSwitch: boolean;
}
