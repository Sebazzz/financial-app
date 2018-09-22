import { Router } from 'AppFramework/Navigation/Router';

export default class NowRouteProvider {
    public getParams() {
        const currentDate = new Date(),
            currentMonth = currentDate.getMonth() + 1,
            currentYear = currentDate.getFullYear();

        return {
            month: currentMonth,
            year: currentYear
        };
    }

    public getRoute(router: Router) {
        return router.getRoute('archive.sheet', this.getParams());
    }
}
