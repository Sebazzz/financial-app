declare namespace sw {
    export interface IAssetList {
        assets: string[];,
        versionTimestamp: string;
    }
}

declare var serviceWorkerOption: sw.IAssetList;