import extendBindingContext from './BindingContextExtender';
import * as ko from 'knockout';

type BindingAccessors = { [key: string]: string; };
type Bindings = {};
type BindingMap = Array<{ key: string, value: string }>;
type PreprocessBindings = (bindings: BindingMap|string, options: {valueAccessors:boolean})=>string;

type BindingsFactory = (bindingContext: KnockoutBindingContext, node: Node) => BindingAccessors;

type ParsedAttributeBinding = [string, Array<string>];

interface INestedPropertyBinding {
     [key: string]: INestedPropertyBinding | string
};

const defaultBindingProvider = ko.bindingProvider.instance,
      attributePrefix = 'ko-',
      bindingCache: { [key: string]: BindingsFactory; } = {},
      propertyBindingCache: { [key: string]: ParsedAttributeBinding } = {};

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

    // Typescript bindings for preProcessBindings not available, so work around it
    const preProcessBindings = (ko.expressionRewriting as any).preProcessBindings as PreprocessBindings,
          newBindings = preProcessBindings(bindings, {valueAccessors: true}),
          functionBody = `with($context){with($data||{}){return{${newBindings}}}}`,
          func = new Function('$context', '$element', functionBody);

    return bindingCache[cacheKey] = func as BindingsFactory;
}

function getBindingInfo(attributeName: string): ParsedAttributeBinding {
    // Attributes in HTML are case insensitive, so we will not be able to represent
    // a binding for "textInput" as "ko-textInput", so we will need to represent it 
    // as "ko-text-input" instead.

    // Subproperties may be represented using a colon:
    // These attributes: 
    //   ko-css:required="true"
    //   ko-css:invalid="true"
    // Will yield this binding:
    //   data-bind="css: { required: true, invalid: true }"
    //
    // Sometimes you want property names to stay as-is, for CSS classes.
    // Use a star to escape them, for instance:
    //   ko-css:*is-required="true"
    // Yields:
    //   data-bind="css: { 'is-required: true }"


    const subPropertyCharacter = ':',
          camelCaseEscapeCharacter = '*',
          camelCaseCharacter = '-',
          cachedProperties = propertyBindingCache[attributeName];

    if (cachedProperties) {
        return cachedProperties;
    }

    let bindingName = attributeName.toLowerCase();
    
    // ... Split into properties
    const subProperties = bindingName.split(subPropertyCharacter);

    for (let index = 0; index < subProperties.length; index++) {
        let subProperty = subProperties[index],
            skipCamelCaseTransformation = subProperty.indexOf(camelCaseEscapeCharacter) === 0;

        if (skipCamelCaseTransformation) {
            subProperty = subProperty.substr(1);
        }

        if (!subProperty) {
            throw new Error(`Invalid attribute name: ${attributeName}`);
        }

        if (!skipCamelCaseTransformation) {
            let dashIndex = 0;
            while ((dashIndex = subProperty.indexOf(camelCaseCharacter, dashIndex)) !== -1) {
                if (dashIndex + 1 >= subProperty.length) {
                    throw new Error(`Invalid attribute name: ${attributeName}`);
                }

                subProperty = subProperty.substr(0, dashIndex) + subProperty.substr(dashIndex + 1, 1).toUpperCase() + subProperty.substr(dashIndex + 2);
            }
        }

        subProperties[index] = subProperty;
    }
    
    bindingName = subProperties.shift() || bindingName;

    const result : ParsedAttributeBinding = [bindingName, subProperties];
    propertyBindingCache[attributeName] = result;

    return result;
}

/**
 * Build bindings from nested properties
 * 
 * @param subPropertyBindings
 * @param bindingMap
 */
function flattenNestedProperties(subPropertyBindings: INestedPropertyBinding, bindingMap: BindingMap) {
    function createBindingValue(propertyBindings: INestedPropertyBinding): string {
        let keyValues : string[] = [];

        for (const propName of Object.keys(propertyBindings)) {
            const propValue = propertyBindings[propName],
                  strValue = typeof propValue === 'string' ? propValue : createBindingValue(propValue);

            keyValues.push(`'${propName}': ${strValue}`);
        }

        return `{ ${keyValues.join(', ')} }`;
    }

    for (const bindingName of Object.keys(subPropertyBindings)) {
        const subValue = subPropertyBindings[bindingName],
              bindingValue = typeof subValue === 'string' ? subValue : createBindingValue(subValue);

        bindingMap.push({ key: bindingName, value: bindingValue });
    }
}

function getEscapedPropertyValue(bindingName: string, bindingValue: string) : [string,string]|null {
    const escapePropertyMarker = '#',
          escape = '\'',
          lastIndex = bindingName.length - 1;

    if (bindingName.lastIndexOf(escapePropertyMarker) === lastIndex) {
        const escapedBindingValue = escape + bindingValue.replace(escape, '\\' + escape) + escape;
        return [bindingName.substr(0, lastIndex), escapedBindingValue];
    }

    return null;
}

function getBindingAccessors(node: Node, bindingContext: KnockoutBindingContext): BindingAccessors|null {
    if (!isElement(node) || !node.hasAttributes()) {
        return {};
    }

    const attributes = node.attributes,
          bindingMap: BindingMap = [],
          subPropertyBindings: INestedPropertyBinding = {};

    let cacheKey = '';
    for (let index = 0; index < attributes.length; index++) {
        const attribute = attributes[index],
              attributeName = attribute.name;

        if (attributeName.indexOf(attributePrefix) === 0) {
            const [bindingName, subProperties] = getBindingInfo(attributeName.substr(attributePrefix.length)), bindingValue = attribute.value;

            if (subProperties.length === 0) {
                const escaped = getEscapedPropertyValue(bindingName, bindingValue);

                bindingMap.push({ key: escaped ? escaped[0] : bindingName, value: escaped ? escaped[1] : bindingValue });
            } else {
                let item = subPropertyBindings[bindingName];

                if (typeof item === 'string') {
                    throw new Error(`Invalid binding: ${attributeName}. Nested properties on different levels found.`);
                } else if (typeof item === 'undefined') {
                    item = {};
                    subPropertyBindings[bindingName] = item;
                }

                for (let propertyIndex = 0; propertyIndex < subProperties.length; propertyIndex++) {
                    const subProperty = subProperties[propertyIndex],
                          isLastProperty = propertyIndex + 1 === subProperties.length;

                    const subItem = item[subProperty];

                    if (typeof subItem === 'string') {
                        throw new Error(`Invalid binding: ${attributeName}. Nested properties on different levels found.`);
                    } else if (typeof subItem === 'undefined') {
                        if (isLastProperty) {
                            const escaped = getEscapedPropertyValue(subProperty, bindingValue);

                            item[escaped ? escaped[0] : subProperty] = escaped ? escaped[1] : bindingValue;
                        } else {
                            const val = ({} as INestedPropertyBinding);
                            item[subProperty] = val;
                            item = val; // Go one level deeper
                        }
                    } else if (isLastProperty) {
                        throw new Error(`Invalid binding: ${attributeName}. Nested properties on different levels found.`);
                    }
                }
            }

            cacheKey += `[${bindingName}]=${bindingValue}`;
        }
    }

    flattenNestedProperties(subPropertyBindings, bindingMap);

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