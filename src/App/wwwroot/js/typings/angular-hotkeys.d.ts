declare module ng.Hotkeys {
    interface IHotkeysService {
        add(key: IHotkey);
        add(combo: string, description: string, callback: Function);
    }

    interface IHotkey {
        combo: string;
        description: string;
        callback: Function;
    }
}