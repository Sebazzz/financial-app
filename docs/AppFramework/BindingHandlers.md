# The _Unnamed_ application framework documentation

## Binding handlers

The _Unnamed_ framework comes with several bindings to make life easier.

### `hidden`

This is the inverted version of knockout built-in `visible`.

Usage:

    <element data-bind="hidden: myObservable"/>

### `href`

Binding with can:

1. Simply act as a shorthand for `attr` in combination with `href`: Set the target of an hyperlink.
2. Set the hyperlink `href` to an generated path to a route.

Usage (1):

    <a data-bind="href: '/example.html'" href="#"></a>
    <a data-bind="href: myDestination" href="#"></a>

Usage (2):

    <a data-bind="href: { route: 'edit', params: { id: 3 }}" href=""></a>

### `route`

Similar to `href`, the `route` binding allows setting the destination of an hyperlink to a page. The main difference is that this binding allows an alternate syntax, which is especially useful in the case your route does not have any parameters.

Usage (no parameters):

    <a data-bind="href: product.create" href="#"></a>

Usage (with parameters):

    <a data-bind="href: product.edit | { id: $data.id }" href="#"></a>

### `formatText`

Supports formatting text like .NET format strings. It formats string similar to Kendo UI [`format`](http://docs.telerik.com/kendo-ui/api/javascript/kendo#methods-format) or [`toString`](http://docs.telerik.com/kendo-ui/api/javascript/kendo#methods-toString) method. When no format string is detected (containing `{` or `}`) `toString` is called. Not all options are supported.

Supported format strings can be found in [`Date.ts`](../../src/App/js/AppFramework/Internationalization/Date.ts) and [`Number.ts`](../../src/App/js/AppFramework/Internationalization/Number.ts).

The additional `format` binding is used for specifying the string format.

Usage:

    <span class="money" data-bind="formatText: amount, format: 'c'"></span>

    <span class="money" data-bind="formatText: amount, format: 'I am rich, I got {0:c} in my wallet.'"></span>

### Lazy loading binding handlers

Some binding handlers rely on libraries you probably want to have lazy loaded, once they are used. You can use the lazy binding handler to support this scenario.

Simply import the 'LazyBindingHandler' and use the default exported `register` function to register your binding handler. The function takes the name of the binding handler (1), the callback returning a promise for loading the library (2), and the binding handler definition (3), where `init` takes the result of the loaded library. An optional parameter (4) is called to modify the element while the dependency is loading.

Usage:

    import registerBindingHandler from 'AppFramework/BindingHandlers/LazyBindingHandler';

    registerBindingHandler(
    	'lazyHello',
        () => import('./HeavyHello'),
        {
             init: (lib, element) => {
                 element.innerText = lib.hello();
             }
        },
        (element) => element.innerText = 'Loading'
    );

### `tooltip`

This binding handler puts a tooltip on the element. Optionally it can be forced to show immediately.

Usage:

     <button data-bind="tooltip: 'Hello ' + name()"></button>

Usage (manually controlled):

     <button data-bind="tooltip: { text: name, forceOpen: !!name() }"></button>

### `form`, `validationMessage` and `validationProperty`

The `form` binding handler supports forms and catch-all error handling. The `validationMessage` and `validationProperty` binding handlers support server-side validation. See [Forms and validation](Forms-and-validation.md) for more information.

### `lookupScope`

Enables looking up a value from an array from another scope. For instance: you have an array of ids and elsewhere an array of objects corresponding to those ids. In that case you want to get all objects with the current ids. The looked up value or values (in case of an array) will end up in the magic variable `$lookup`. This is a writeable observable, so any changes will be reflected back on the parent entity.

For instance this parent object:

    { availableCategories: Category[] }

With this child object:

    { categoryId: observable(number) }

This binding would extract the name:

    <!-- ko lookupScope: { data: categoryId, source: $parent.availableCategories } -->
    <span data-bind="text: $lookup">(category name will appear here)</span>
    <!-- /ko -->

### `bindingContextLog`

The `bindingContextLog` binding handler has no effect on the DOM but logs the current binding context and parent binding context inside a "console group". Usage:

    <!-- ko bindingContextLog: 'my title' --><!-- /ko -->

### `responsiveRender`

The `responsiveRender` binding handler renders only the contained element or elements if the application considers itself being rendered on a mobile or otherwise mobile-media query triggering device. This is useful to prevent seeping resources to render something that is not going to show anyway.

Accepts either `desktop` or `mobile` as a string argument. Usage:

    <!-- ko responsiveRender: 'mobile' --><p>I will only render and bind on mobile!</p><!-- /ko -->

### `asyncLoadingPanel`

Allows partial page loading with error handling and progress reporting. This prevents you from needing to prevent page loading while the potential slow loading is happening, while at the same time errors while loading are separatedly caught.

The panel renders with a child binding context with two extra variables:

-   `$dataSource`: The `AsyncDataSource<T>` instance that is in use.
-   `$model`: The view model at the element level (often same as `$parent`).

Must be passed an instance of `AsyncDataSource<T>`.

     <div ko-async-loading-panel="mySlowApiLoader"><span ko-text="$data"></span></div>
