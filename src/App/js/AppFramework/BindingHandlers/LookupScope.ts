import * as ko from 'knockout';

type PropertySelector<TSource, TIdentifier> = (item: TSource) => TIdentifier;

interface ISubstituteScopeOptions<TSource,TIdentifier> {
    data: TIdentifier[] | KnockoutObservableArray<TIdentifier> | TIdentifier | KnockoutObservable<TIdentifier>;
    source: TSource[] | KnockoutObservableArray<TSource>;

    selector: string | PropertySelector<TSource, TIdentifier>;
}

function makeAccessor<TSource, TIdentifier>(propertyName : string): PropertySelector<TSource, TIdentifier> {
    return el => (el as any)[propertyName] as TIdentifier;
}

ko.bindingHandlers['lookupScope'] = {
    init<TSource, TIdentifier>(element: Node, valueAccessor: () => ISubstituteScopeOptions<TSource, TIdentifier>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {
        const options = valueAccessor(),
              accessor = typeof options.selector === 'string' ? makeAccessor<TSource, TIdentifier>(options.selector) : options.selector,
              childData = ko.computed({
                read: () => {
                    const identifiers = ko.unwrap<TIdentifier[] | TIdentifier>(options.data), sourceData = ko.unwrap(options.source);

                    if (sourceData === null) {
                        throw new Error('lookupScope: options.source is null');
                    }

                    if (!$.isArray(identifiers)) {
                        const identifier = identifiers,
                              lookup = sourceData.filter((val) => identifier === accessor(val))[0];

                        return lookup;
                    }

                    return sourceData.filter((val) => identifiers.indexOf(accessor(val)) !== -1);
                },
                write: (data: TSource[] | TSource) => {
                    if (!ko.isObservable<TIdentifier | TIdentifier[]>(options.data)) {
                        return;
                    }

                    if ($.isArray(ko.utils.peekObservable<TIdentifier[] | TIdentifier>(options.data))) {
                        // case: target is array
                        if (ko.isWriteableObservable<TIdentifier | TIdentifier[]>(options.data)) {
                            (options.data as KnockoutObservableArray<TIdentifier>)((data as TSource[]).map(val => accessor(val)));
                        }
                    } else {
                        // case: target is single-value
                        if (ko.isWriteableObservable<TIdentifier | TIdentifier[]>(options.data)) {
                            (options.data as KnockoutObservable<TIdentifier>)(accessor(data as TSource));
                        }
                    }
                }
              }).extend({ disposeWhenNodeIsRemoved: element});

        const ctx = bindingContext.extend({
            $lookup: childData
        });

        ko.applyBindingsToDescendants(ctx, element);

        return { controlsDescendantBindings: true };
    }
};
ko.virtualElements.allowedBindings.lookupScope = true;