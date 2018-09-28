declare namespace sw {
    export interface IAssetList {
        assets: string[];
        versionTimestamp: string;

        /**
         * Build target type
         */
        targetName: string;
    }
}

declare var serviceWorkerOption: sw.IAssetList;
