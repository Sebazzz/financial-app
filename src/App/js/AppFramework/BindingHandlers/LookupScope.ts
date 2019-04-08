import * as ko from 'knockout';

type PropertySelector<TSource, TIdentifier> = (item: TSource) => TIdentifier;

interface ISubstituteScopeOptions<TSource, TIdentifier> {
    data: ko.MaybeObservableArray<TIdentifier> | ko.MaybeObservable<TIdentifier>;
    source: TSource[] | ko.ObservableArray<TSource>;

    selector: string | PropertySelector<TSource, TIdentifier>;
}

function makeAccessor<TSource, TIdentifier>(propertyName: string): PropertySelector<TSource, TIdentifier> {
    return el => (el as any)[propertyName] as TIdentifier;
}

ko.bindingHandlers.lookupScope = {
    init<TSource, TIdentifier>(
        element: Node,
        valueAccessor: () => ISubstituteScopeOptions<TSource, TIdentifier>,
        allBindingsAccessor: ko.AllBindings,
        viewModel: any,
        bindingContext: ko.BindingContext
    ) {
        const options = valueAccessor(),
            accessor =
                typeof options.selector === 'string'
                    ? makeAccessor<TSource, TIdentifier>(options.selector)
                    : options.selector,
            childData = ko.computed<TSource | TSource[]>({
                read: () => {
                    const identifiers = ko.unwrap<TIdentifier[] | TIdentifier>(options.data);
                    const sourceData = ko.unwrap(options.source);

                    if (sourceData === null) {
                        throw new Error('lookupScope: options.source is null');
                    }

                    if (!Array.isArray(identifiers)) {
                        const identifier = identifiers,
                            lookup = sourceData.filter(val => identifier === accessor(val))[0];

                        return lookup;
                    }

                    return sourceData.filter(val => identifiers.indexOf(accessor(val)) !== -1);
                },
                write: (data: TSource[] | TSource) => {
                    if (!ko.isObservable<TIdentifier | TIdentifier[]>(options.data)) {
                        return;
                    }

                    if ($.isArray(ko.utils.peekObservable<TIdentifier[] | TIdentifier>(options.data))) {
                        // case: target is array
                        if (ko.isWriteableObservable<TIdentifier | TIdentifier[]>(options.data)) {
                            (options.data as ko.ObservableArray<TIdentifier>)(
                                (data as TSource[]).map(val => accessor(val))
                            );
                        }
                    } else {
                        // case: target is single-value
                        if (ko.isWriteableObservable<TIdentifier | TIdentifier[]>(options.data)) {
                            (options.data as ko.Observable<TIdentifier>)(accessor(data as TSource));
                        }
                    }
                },
                disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */
            });

        const ctx = bindingContext.extend({
            $lookup: childData
        });

        ko.applyBindingsToDescendants(ctx, element);

        return { controlsDescendantBindings: true };
    }
};
ko.virtualElements.allowedBindings.lookupScope = true;
