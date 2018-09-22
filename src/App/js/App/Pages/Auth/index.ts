import { PageRegistrationCollection } from 'AppFramework/Navigation/Page';

export default [
    {
        id: 'AuthConfirmEmailPage',
        routingTable: [{ name: 'auth.confirmEmail', path: '/confirm-email' }],
        loadAsync: () => import('./ConfirmEmailPage'),
        bodyClassName: 'page-login'
    },
    {
        id: 'AuthForgotPasswordPage',
        routingTable: [{ name: 'auth.forgotPassword', path: '/forgot-password' }],
        loadAsync: () => import('./ForgotPasswordPage'),
        bodyClassName: 'page-login'
    },
    {
        id: 'AuthLoginPage',
        routingTable: [
            { name: 'auth', path: '/auth', forwardTo: '/auth/login' },
            { name: 'auth.login', path: '/login' }
        ],
        loadAsync: () => import('./LoginPage'),
        bodyClassName: 'page-login'
    },
    {
        id: 'AuthLogOffPage',
        routingTable: { name: 'auth.logoff', path: '/logoff' },
        loadAsync: () => import('./LogOffPage'),
        bodyClassName: 'page-logoff'
    },
    {
        id: 'AuthResetPasswordPage',
        routingTable: [{ name: 'auth.resetPassword', path: '/reset-password' }],
        loadAsync: () => import('./ResetPasswordPage'),
        bodyClassName: 'page-login'
    }
] as PageRegistrationCollection;
