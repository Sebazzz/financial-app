# The *Unnamed* application framework documentation

## Pages
A SPA contains of multiple navigatable pages. Pages are registered via a declaration. The declaration describes the routes is available on and which template to load. Finally, the declaration provides the factory method used for creating the page instance, see [the `Page` class](#The-Page-Class).

The declaration must contain all the properties as described in [`IPageRegistration`](../../src/App/js/AppFramework/Page.ts). 

Example:

```
export default {
    id: module.id,
    templateName: 'manage/category/edit',
    routingTable: [
        { name: 'manage.category.edit', path: '/edit/:id' },
        { name: 'manage.category.add', path: '/add'}
    ],
    createPage: (appContext) => new EditPage(appContext)
};
```

Register pages via the `App.addPages` method.

### Hot Module Replacement
Hot Module Replacement, the webpack way of inserting updated code, is supported. Just insert the updated declarations via `App.replacePages` and the framework will figure out which pages are updated. If the current page needs to be updated, the application will reload the current page.

Templates of pages will automatically be reloaded and do not need any support from user code.

### Memory leaks
Swapping pages in and out might cause memory leaks. When a page is deactived all observables and computed observables are automatically disposed.

### The Page Class
Your page should derive from [`Page`](../../src/App/js/AppFramework/Page.ts). The page can set the title via the `Page.title` observable.

#### Activation
When the page is activated the `Page.activate` method is called and is expected to return a promise. This allows a page to load its dependencies or data while the user is presented with a loading screen.

#### Deactivation
When a page is deactivated the `Page.deactivate` method is called. It is expected to return immediately. 