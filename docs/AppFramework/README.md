# Knockout Single-Page Application Framework

Financial App runs on a small single page application framework. The single page application framework does - reversely - not depend on the application and is reusable in other applications. This document describes the unnamed SPA framework (hereafter called *Unnamed*) and how to use it in an application.

## Concepts
The *Unnamed* framework provides building blocks to build a single page application. The framework is written in Typescript and relies on [router5](http://router5.github.io/) for providing routing.  

### The Application Class
An class deriving from the `App` class provides the main initialization and configuration logic  for the application. The App class registers the pages and any sub-components.

### Pages
A SPA contains of multiple navigatable pages. Pages are registered via a declaration.

The [pages](Pages.md) documentation describes how pages are plugged into the application.

## Binding handlers
The *Unnamed* framework comes with several bindings to make life easier.

Please see the [binding handlers](BindingHandlers.md) documentation for more information.

## Forms and validation
The framework has built-in support for server-side validation of filled in forms. 

Please see the [forms and validation](Forms-and-validation.md) documentation for more information.