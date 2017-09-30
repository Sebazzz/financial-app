# The *Unnamed* application framework documentation
## Binding syntax
The *Unnamed* framework offers a custom binding syntax. This is a syntax that you can use if the regular data-bind bindings become unmaintainable long. The syntax does not get in the way if you do not use it.

Regular data-bind syntax may become cumbersome if you have many bindings to apply to an element. Either the attribute gets very long:

    data-bind="visible: myBoolean, text: myText, if: myCondition() ? test1() : test2()"

Or you can spread it over multiple lines:

    data-bind="
		visible: myBoolean, 
		text: myText, 
		if: myCondition() ? test1() : test2()"

But the above syntax does not feel very "HTML". The syntax offered by this framework allows writing your bindings in a different way.

### General syntax
The general syntax is as follows:

    <element ko-binding="value" />

Which is equivalent to:

    <element data-bind="binding: value" />

### Camelcase binding handlers
Some binding handlers use camel-case names, for instance `textInput`. Since HTML attributes are case-insensitive, these binding handlers cannot be read as-is. Instead, use lowercase names and a dash before the uppercase character to represent the binding.

For example `ko-text-input` instead of `ko-textInput`.
