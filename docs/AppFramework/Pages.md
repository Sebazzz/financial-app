# The _Unnamed_ application framework documentation

## Pages

A SPA contains of multiple navigatable pages. Pages are registered via a declaration, which allows loading the page module. The page itself is activated through a "page module descriptor".

The declaration:

-   Describes the routes that are pointing to the page.
-   Provides a method for asynchronously loading the page module. This allows code splitting.
-   The declaration must contain all the properties as described in [`IPageRegistration`](../../src/App/js/AppFramework/Navigation/Page.ts).

The module of the page exports a page module descriptor. The page module descriptor:

-   Contains the templates used for the page, if needed both mobile and regular. The templates are asynchronously loaded via a promise.
-   The declaration must contain all the properties as described in [`IPageModule`](../../src/App/js/AppFramework/Navigation/Page.ts).
-   Provides a factory method for creating the page instance, see [the `Page` class](#The-Page-Class).

Example page declaration

```
export default {
    id:  'CategoryEditPage',
    templateName: 'manage/category/edit',
    routingTable: [
        { name: 'manage.category.edit', path: '/edit/:id' },
        { name: 'manage.category.add', path: '/add'}
    ],
    loadAsync: () => import('./EditPage')
};
```

Example page module descriptor:

```
export default {
    id: module.id,
    template: import('manage/category/edit'),
    createPage: (appContext) => new EditPage(appContext)
};
```

You can fold the page template into the chunk of the page module by supplying `/*webpackMode: "eager"*/` inside the `import()` call.

Register pages via the `App.addPages` method.

### Hot Module Replacement

Hot Module Replacement, the webpack way of inserting updated code, is supported. Just insert the updated declarations via `App.replacePages` and the framework will figure out which pages are updated. If the current page needs to be updated, the application will reload the current page.

Templates of pages will automatically be reloaded and do not need any support from user code.

### Memory leaks

Swapping pages in and out might cause memory leaks. When a page is deactived all observables and computed observables are automatically disposed. This is done by walking the immediate properties of the page. Any object with a `dispose` method will have the mentioned method called.

### The Page Class

Your page should derive from [`Page`](../../src/App/js/AppFramework/Navigation/Page.ts). The page can set the title via the `Page.title` observable.

#### Activation

When the page is activated the `Page.activate` method is called and is expected to return a promise. This allows a page to load its dependencies or data while the user is presented with a loading screen. The page template is bound when both the template and the `Page.activate` method returned successfully.

#### Deactivation

When a page is deactivated the `Page.deactivate` method is called. It is expected to return immediately. Async calls must be "fire and forget".
