# The *Unnamed* application framework documentation
## Inline templating syntax
The *Unnamed* framework offers a syntax that allows you to insert values from observables directly into the text HTML without requiring cumbersome additional spans or comment nodes.

Example:

    <div>Hello, I am {{name}} and my age is <strong>{{age}}</strong>.</div>

Is equivalent to:

    <div>Hello, I am <!-- ko text: name --><!-- /ko --> and my age is <strong><!-- ko text: age --><!-- /ko --></strong></div>

The new syntax is much more terse and is more readable.

