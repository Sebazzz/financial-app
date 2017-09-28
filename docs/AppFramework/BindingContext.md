# The *Unnamed* application framework documentation
## Binding context
The framework extends the [default binding context](http://knockoutjs.com/documentation/binding-context.html) with several properties relevant to single page applications.

The extra properties that are available and can be used with bindings are documented below.

### `$app`
This property returns the application class instance.

### `$appContext`
Returns the application context, see the [Application Context](README.md#Application-Context) documentation.

### `$page`
When used inside a page template, refers to the page instance. See also the [pages documents](Pages.md).