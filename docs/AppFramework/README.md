# The _Unnamed_ application framework documentation

Financial App runs on a small single page application framework. The single page application framework does - reversely - not depend on the application and is reusable in other applications. This document describes the unnamed SPA framework (hereafter called _Unnamed_) and how to use it in an application.

## Concepts

The _Unnamed_ framework provides building blocks to build a single page application. The framework is written in Typescript and relies on [router5](http://router5.github.io/) for providing routing.

### The Application Class

An class deriving from the `App` class provides the main initialization and configuration logic for the application. The App class registers the pages and any sub-components.

### Application Context

Assigned by the framework and reachable via `app.context`, the Application Context offers common services like routing and authentication.

### Pages

A SPA contains of multiple navigatable pages. Pages are registered via a declaration.

The [pages](Pages.md) documentation describes how pages are plugged into the application.

## Binding context

The framework extends the [default binding context](http://knockoutjs.com/documentation/binding-context.html) with several properties relevant to single page applications.

The [binding context](BindingContext.md) documentation describes the available properties.

## Binding handlers

The _Unnamed_ framework comes with several bindings to make life easier.

Please see the [binding handlers](BindingHandlers.md) documentation for more information.

## Binding syntax

The _Unnamed_ framework offers a custom binding syntax. This is a syntax that you can use if the regular data-bind bindings become unmaintainable long. The syntax does not get in the way if you do not use it.

Please see the [binding syntax](BindingSyntax.md) and [inline templating syntax](InlineTemplating.md) documentation for more information.

## Forms and validation

The framework has built-in support for server-side validation of filled in forms.

Please see the [forms and validation](Forms-and-validation.md) documentation for more information.

## Internationalization

The framework provides some useful methods for number/date parsing and formatting, and using composite format strings.

See the [Internationalization modules](../../src/App/js/AppFramework/Internationalization/).
