# The *Unnamed* application framework documentation

## Forms and validation
The framework has built-in support for server-side validation of filled in forms. 

The view model being send to the server must derive from `ValidateableViewModel`. Once a API call is returned with a status of `400 Bad Request`, you can call `tryExtractValidationError` providing the `xhr` and view model.

The model state of the view model will be updated, and in response the `validationMessage` and `validationProperty` binding handlers will respond.

The page of the form must derive from `FormPage`. When the `btn-primary` of a form is clicked, the `save` method of the page is invoked returning a promise. 

Example:

```
class MyPage extends FormPage {
	public entity = ko.observable<MyEntity>();
	
	public async save() {
		const entity = this.entity();

		try {
			await this.webService.save(entity);
		} catch (e) {
			if (tryExtractValidationError(e, entity)) {
				return;
				// The form binding handler will take it from here, setting the validation message and the validationProperty handlers will automatically mark the errorred fields
			}
			
			// Different error
			throw e;
		}
	}
}
```

```

<form data-bind="form" novalidate>
	<div>
		<label>
			<input data-bind="value: name"
                   type="text"
                   required />
		</label>

		<div data-bind="validationMessage: name"></div>
	</div>

	<p><button class="btn btn-primary">Save</button></p>
</form>

```

Whenever a `value` or `textInput` binding is used, the validation fields can automatically be marked. In case you need to mark a parent container instead, you can use the `validationProperty` binding:

    <div class="checkbox-container"
         data-bind="validationProperty: agreeToTerms">
		[...]
    </div>

### Server validation message
When validation fails, the server is expected to return a HTTP `400 Bad Request` error. The returned object contains the properties that are in error, and the validation messages that accompany them: 

    { name: ['You must enter a name'] }

