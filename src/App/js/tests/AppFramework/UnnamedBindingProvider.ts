import { expect } from 'chai';
import * as ko from 'knockout';
import register from 'AppFramework/UnnamedBindingProvider';

let currentBindingValue: any | null | undefined = null;
let bindingWasInvoked = false;

const viewModel = {
    prop: Math.random()
};

type Attributes = { [key: string]: string };

// ReSharper disable WrongExpressionStatement

function invokeBindings(attributes: Attributes|string) {
    const element = document.createElement('div');

    if (typeof attributes === 'string') {
        element.innerHTML = attributes;
    } else {
        for (const attr in attributes) {
            if (attributes.hasOwnProperty(attr)) {
                const attrObject = document.createAttribute(attr);
                attrObject.value = attributes[attr];

                element.setAttributeNode(attrObject);
            }
        }
    }

    ko.applyBindings(viewModel, element);
}

function expectBindingToBeInvoked() {
    expect(bindingWasInvoked, 'Expect the binding "testbinding" to be invoked').to.be.true;
}

function expectBindingNotToBeInvoked() {
    expect(bindingWasInvoked, 'Expect the binding "testbinding" not to be invoked').not.to.be.true;
}

function expectBindingValue() {
    return expect(currentBindingValue, 'Expect binding value to have been set');
}

describe('UnnamedBindingProvider', () => {
    before('Set-up binding provider', () => {
        register();

        ko.bindingHandlers['testBinding'] = ko.bindingHandlers['singlewordbinding'] = {
            init(element: Element, valueAccessor: () => any) {
                //console.info('testBinding: invoked init');
                currentBindingValue = valueAccessor();
                bindingWasInvoked = true;
            }
        };
    });

    beforeEach(() => {
        bindingWasInvoked = false;
    });

    describe('backwards compatibility', () => {
        it('data-bind attribute works as usual: undefined value', () => {
            invokeBindings({ 'data-bind': 'testBinding'});

            expectBindingToBeInvoked();
        }); 

        it('data-bind attribute works as usual: defined value', () => {
            invokeBindings({ 'data-bind': 'testBinding: 1234' });

            expectBindingToBeInvoked();
            expectBindingValue().to.be.eq(1234);
        }); 

        it('data-bind is invoked over custom binding', () => {
            invokeBindings({ 'data-bind': 'testBinding: 4321', 'ko-test-binding': '1234' });

            expectBindingToBeInvoked();
            expectBindingValue().to.be.eq(4321);
        });
    });

    describe('kebab-case to camelCase', () => {
        it('test-binding is converted to testBinding', () => {
            invokeBindings({ 'ko-test-binding': '1337' });

            expectBindingToBeInvoked();
            expectBindingValue().to.be.eq(1337);
        });

        it('singlewordbinding is kept as-is', () => {
            invokeBindings({ 'ko-singlewordbinding': '9000' });

            expectBindingToBeInvoked();
            expectBindingValue().to.be.eq(9000);
        });

        it('ko-testBinding: binding not found', () => {
            invokeBindings({ 'ko-testBinding': '1337' });

            expectBindingNotToBeInvoked();
        });
    });

    describe('raw-value passthrough', () => {
        it('number: 4567', () => {
            invokeBindings({ 'ko-test-binding': '4567' });

            expectBindingValue().to.be.eq(4567);
        });

        it('string: "4567x0"', () => {
            invokeBindings({ 'ko-test-binding': '"4567x0"' });

            expectBindingValue().to.be.eq('4567x0');
        });

        it('complex object', () => {
            invokeBindings({ 'ko-test-binding': '{required: true, num: NaN }' });

            expectBindingValue().to.deep.equal({required: true, num: NaN});
        });

        it('from view model', () => {
            invokeBindings({ 'ko-test-binding': 'prop' });

            expectBindingValue().to.be.eq(viewModel.prop);
        });

        it('from view model: expression', () => {
            invokeBindings({ 'ko-test-binding': 'prop + "!!"' });

            expectBindingValue().to.be.eq(viewModel.prop + '!!');
        });
    });

    describe('string literals', () => {
        it(`simple case: my string`, () => {
            invokeBindings(`<div ko-test-binding#="my string"></div>`);

            expectBindingValue().to.be.eq('my string');
        });

        it('simple case: empty', () => {
            invokeBindings(`<div ko-test-binding#=""></div>`);

            expectBindingValue().to.be.eq('');
        });

        it('attribute only', () => {
            invokeBindings(`<div ko-test-binding#></div>`);

            expectBindingValue().to.be.eq('');
        });

        it('escapes', () => {
            invokeBindings(`<div ko-test-binding#="test with 'escapes'"></div>`);

            expectBindingValue().to.be.eq(`test with 'escapes'`);
        });
    });

    describe('nested properties', () => {
        it('single-level single-property', () => {
            invokeBindings(`<div ko-test-binding:inner="prop"></div>`);

            expectBindingValue().to.deep.eq({ inner: viewModel.prop });
        });

        it('single-level multi-property', () => {
            invokeBindings(`<div ko-test-binding:inner="prop"
                                 ko-test-binding:second="true"></div>`);

            expectBindingValue().to.deep.eq({ inner: viewModel.prop, second: true });
        });

        it('single-prop multi-level multi-property', () => {
            invokeBindings(`<div ko-test-binding:inner:base="prop"
                                 ko-test-binding:inner:nested="'test'"></div>`);

            expectBindingValue().to.deep.eq({ inner: { base: viewModel.prop, nested: 'test'} });
        });

        it('single-prop multi-level multi-property - literal', () => {
            invokeBindings(`<div ko-test-binding:inner:base="prop"
                                 ko-test-binding:inner:nested#="test"></div>`);

            expectBindingValue().to.deep.eq({ inner: { base: viewModel.prop, nested: 'test' } });
        });

        it('single-prop multi-level multi-property: escaped', () => {
            invokeBindings(`<div ko-test-binding:inner:base="prop"
                                 ko-test-binding:inner:*is-required="true"></div>`);

            expectBindingValue().to.deep.eq({ inner: { base: viewModel.prop, 'is-required': true } });
        });

        it('single-prop multi-level multi-property: escaped and literal', () => {
            invokeBindings(`<div ko-test-binding:inner:base="prop"
                                 ko-test-binding:inner:*is-required#="true"></div>`);

            expectBindingValue().to.deep.eq({ inner: { base: viewModel.prop, 'is-required': 'true' } });
        });
    });
});