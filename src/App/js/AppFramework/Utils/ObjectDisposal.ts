export interface IDisposable {
    /**
     * Disposes the object: makes sure any memory-references to this object are nullified (for instance, delegates, events, references by observables, etc)
     */
    dispose(): void;
}

export function isDisposable(item: any): item is IDisposable {
    return typeof item !== 'undefined' && typeof item.dispose === 'function';
}

export function disposeObject(obj: any) {
    // Proactively dispose any computed properties to prevent memory leaks

    // ReSharper disable once MissingHasOwnPropertyInForeach
    // tslint:disable-next-line:forin
    for (const property in obj) {
        const item = obj[property];

        if (isDisposable(item)) {
            item.dispose();
        }
    }
}
