import extendBindingContext from './BindingContextExtender';
import * as ko from 'knockout';

type BindingAccessors = { [key: string]: string; };
type Bindings = {};
type BindingMap = Array<{ key: string, value: string }>;
type PreprocessBindings = (bindings: BindingMap|string, options: {valueAccessors:boolean})=>string;

type BindingsFactory = (bindingContext: KnockoutBindingContext, node: Node) => BindingAccessors;

const defaultBindingProvider = ko.bindingProvider.instance,
      attributePrefix = 'ko-',
      bindingCache: { [key: string]: BindingsFactory; } = {};

function isElement(node: Node) : node is Element {
    return node.nodeType === 1;
}

function nodeHasBindings(node: Node) : boolean {
    if (!isElement(node) || !node.hasAttributes()) {
        return false;
    }

    const attributes = node.attributes;
    for (let index = 0; index < attributes.length; index++) {
        const attribute = attributes[index];

        if (attribute.name.indexOf(attributePrefix) === 0) {
            return true;
        }
    }

    return false;
}

function getBindingsEvaluator(bindings: BindingMap, cacheKey: string): BindingsFactory {
    if (bindingCache[cacheKey]) {
        return bindingCache[cacheKey];
    }

    // Typescript bindings for preProcessBindings not available
    const preProcessBindings = (ko.expressionRewriting as any).preProcessBindings as PreprocessBindings,
          newBindings = preProcessBindings(bindings, {valueAccessors: true}),
          functionBody = `with($context){with($data||{}){return{${newBindings}}}}`,
          func = new Function('$context', '$element', functionBody);

    return bindingCache[cacheKey] = func as BindingsFactory;
}

function getBindingAccessors(node: Node, bindingContext: KnockoutBindingContext): BindingAccessors|null {
    if (!isElement(node) || !node.hasAttributes()) {
        return {};
    }

    const attributes = node.attributes, bindingMap: BindingMap = [];
    let cacheKey = '';
    for (let index = 0; index < attributes.length; index++) {
        const attribute = attributes[index],
              attributeName = attribute.name;

        if (attributeName.indexOf(attributePrefix) === 0) {
            const bindingName = attributeName.substr(attributePrefix.length), bindingValue = attribute.value;
            bindingMap.push({ key: bindingName, value: bindingValue });

            cacheKey += `[${bindingName}]=${bindingValue}`;
        }
    }

    if (!cacheKey || bindingMap.length === 0) {
        // No ko-* bindings where found
        return null;
    }

    const evaluator = getBindingsEvaluator(bindingMap, cacheKey);
    return evaluator(bindingContext, node);
}

class UnnamedBindingProvider implements KnockoutBindingProvider {
    public nodeHasBindings(node: Node): boolean {
        if (defaultBindingProvider.nodeHasBindings(node)) {
            if (DEBUG && nodeHasBindings(node)) {
                console.group('Node has both ko-* and data-bind bindings. The ko-* bindings will be ignored.');
                console.error(node);
                console.groupEnd();
            }

            return true;
        }

        return nodeHasBindings(node);
    }

    public getBindings(node: Node, bindingContext: KnockoutBindingContext): Bindings {
        throw new Error('getBindings: not implemented');
    }

    public getBindingAccessors(node: Node, bindingContext: KnockoutBindingContext): BindingAccessors {
        extendBindingContext(bindingContext);

        if (defaultBindingProvider.nodeHasBindings(node)) {
            const defaultMethod = defaultBindingProvider.getBindingAccessors;

            if (!defaultMethod) {
                throw new Error('getBindingAccessors not available');
            }

            return defaultMethod.apply(defaultBindingProvider, arguments);
        }

        const bindings = getBindingAccessors(node, bindingContext),
              delegate = (ko.components as any).addBindingsForCustomElement;

        return delegate(bindings, node, bindingContext, /* valueAccessors */ true);
    }

    public static instance = new UnnamedBindingProvider();
}


export default function() {
    ko.bindingProvider.instance = new UnnamedBindingProvider();
}