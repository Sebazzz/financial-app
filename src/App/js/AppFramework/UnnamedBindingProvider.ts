import extendBindingContext from './BindingContextExtender';
import * as ko from 'knockout';

// tslint:disable-next-line:no-empty-interface
interface IBindings {}
type BindingMap = Array<{ key: string; value: string }>;
type PreprocessBindings = (bindings: BindingMap | string, options: { valueAccessors: boolean }) => string;

type BindingsFactory = (bindingContext: ko.BindingContext, node: Node) => ko.BindingAccessors;

type ParsedAttributeBinding = [string, string[]];

interface INestedPropertyBinding {
    [key: string]: INestedPropertyBinding | string;
}

const defaultBindingProvider = ko.bindingProvider.instance,
    attributePrefix = 'ko-',
    bindingCache: { [key: string]: BindingsFactory } = {},
    propertyBindingCache: { [key: string]: ParsedAttributeBinding } = {};

function isElement(node: Node): node is Element {
    return node.nodeType === 1;
}

/**
 * Transform this:
 *    Hello I am {{name}} and I love the weather!
 *
 * To:
 *    Hello I am <!-- ko text: name --><!-- /ko --> and I love the weather!
 *
 * This means one Text node is transformed to two Text nodes and two Comment nodes.
 *
 * Possible future extensions:
 * - Allow foreaching using the {{#array}} {{/array}} syntax (I'm personally not so fond of this syntax)
 * - Allow inserting html using the {{{variable}}} or {{&variable}} syntax
 */
function transformInnerTextNodes(node: Node) {
    const nodeArray = node.childNodes;

    // Iterate all nodes in reverse. This makes it easier to add nodes and correct the index.
    for (let childNodeIndex = nodeArray.length - 1; childNodeIndex >= 0; childNodeIndex--) {
        const childNode = nodeArray[childNodeIndex];
        if (!(childNode instanceof Text)) {
            continue;
        }

        const textContent = childNode.textContent;
        if (!textContent || textContent.length === 0) {
            continue;
        }

        const newNodes: Node[] = [],
            nodeFactory = document;

        // We will now loop and create new nodes as necessary
        let strIndex = 0,
            lastIndex = 0;

        const nuggetBoundaryLength = 2;
        while (strIndex < textContent.length && strIndex !== -1) {
            strIndex = textContent.indexOf('{{', strIndex);

            if (strIndex === -1) {
                if (lastIndex > 0) {
                    // We have one additional text node to create: the "leftover" from the previous iteration
                    const substr = textContent.substr(lastIndex);

                    if (substr.length > 0) {
                        newNodes.push(nodeFactory.createTextNode(substr));
                    }
                }

                break;
            }

            // Find the first bracket
            const initialIndex = strIndex + nuggetBoundaryLength;
            strIndex = textContent.indexOf('}}', initialIndex);

            if (strIndex === -1) {
                const nugget = textContent.substr(initialIndex);
                throw new UnnamedBindingProviderError(`Unterminated inline template nugget:
{{${nugget}

In string literal:
${textContent}`);
            }

            // Find the final bracket
            const nugget = textContent.substring(initialIndex, strIndex);
            if (nugget.length === 0) {
                throw new UnnamedBindingProviderError(`Empty inline template nugget, in string literal:
${textContent}`);
            }

            // Now we have a template nugget, we can split it:
            // - The part before, until the last index until the start of the nugget becomes one node
            // - The part after the nugget becomes one node (we don't now how far it goes, so we just increase the strIndex)
            // - The nugget itself comes a inline comment node of knockout (<!-- ko text: nugget --></-- /ko -->)
            const beforeTextContent = textContent.substring(
                lastIndex,
                Math.max(initialIndex - nuggetBoundaryLength, 0)
            );
            if (beforeTextContent.length > 0) {
                newNodes.push(nodeFactory.createTextNode(beforeTextContent));
            }

            // ... Create the comment nodes for the nugget itself
            newNodes.push(nodeFactory.createComment(` ko text: ${nugget} `));
            newNodes.push(nodeFactory.createComment(' /ko '));

            // Correct the indices for the nugget boundary length
            strIndex += nuggetBoundaryLength;
            lastIndex = strIndex;
        }

        // If we not have modified any nodes, we can skip to the next node, which will be the previous node in the DOM
        if (newNodes.length === 0) {
            continue;
        }

        const nextChildNode = childNode.nextSibling;
        for (const newNode of newNodes) {
            if (nextChildNode) {
                node.insertBefore(newNode, nextChildNode);
            } else {
                node.appendChild(newNode);
            }
        }

        // ... Complete the replacement
        node.removeChild(childNode);

        // Because we added the nodes after the current node
        // we don't need to correct the index. The current index
        // points to the first new node, and we will continue to the next
        // node, which would be childNode.previousSibling
    }
}

function nodeHasTemplatableInnerText(node: Node): boolean {
    for (let childNodeIndex = 0, nodeArray = node.childNodes; childNodeIndex < nodeArray.length; childNodeIndex++) {
        const childNode = nodeArray[childNodeIndex];
        if (!(childNode instanceof Text)) {
            continue;
        }

        const textContent = childNode.textContent;
        if (!textContent) {
            continue;
        }

        const bracketIndex = textContent.indexOf('{{');
        if (bracketIndex !== -1) {
            if (textContent.indexOf('}}', bracketIndex) !== -1) {
                // This appears to contain at least one valid binding
                return true;
            }
        }
    }

    return false;
}

function nodeHasBindings(node: Node): boolean {
    if (!isElement(node)) {
        // We cannot process non-elements
        return false;
    }

    if (!node.hasAttributes()) {
        return nodeHasTemplatableInnerText(node);
    }

    const attributes = node.attributes;

    // tslint:disable-next-line:prefer-for-of - rationale: object is not array-like
    for (let index = 0; index < attributes.length; index++) {
        const attribute = attributes[index];

        if (attribute.name.indexOf(attributePrefix) === 0) {
            return true;
        }
    }

    return nodeHasTemplatableInnerText(node);
}

function getBindingsEvaluator(bindings: BindingMap, cacheKey: string): BindingsFactory {
    if (bindingCache[cacheKey]) {
        return bindingCache[cacheKey];
    }

    // Typescript bindings for preProcessBindings not available, so work around it
    const preProcessBindings = (ko.expressionRewriting as any).preProcessBindings as PreprocessBindings,
        newBindings = preProcessBindings(bindings, { valueAccessors: true }),
        functionBody = `with($context){with($data||{}){return{${newBindings}}}}`,
        func = new Function('$context', '$element', functionBody);

    return (bindingCache[cacheKey] = func as BindingsFactory);
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
        let subProperty = subProperties[index];
        const skipCamelCaseTransformation = subProperty.indexOf(camelCaseEscapeCharacter) === 0;

        if (skipCamelCaseTransformation) {
            subProperty = subProperty.substr(1);
        }

        if (!subProperty) {
            throw new UnnamedBindingProviderError(`Invalid attribute name: ${attributeName}`);
        }

        if (!skipCamelCaseTransformation) {
            let dashIndex = 0;
            // tslint:disable-next-line:no-conditional-assignment
            while ((dashIndex = subProperty.indexOf(camelCaseCharacter, dashIndex)) !== -1) {
                if (dashIndex + 1 >= subProperty.length) {
                    throw new UnnamedBindingProviderError(`Invalid attribute name: ${attributeName}`);
                }

                subProperty =
                    subProperty.substr(0, dashIndex) +
                    subProperty.substr(dashIndex + 1, 1).toUpperCase() +
                    subProperty.substr(dashIndex + 2);
            }
        }

        subProperties[index] = subProperty;
    }

    bindingName = subProperties.shift() || bindingName;

    const result: ParsedAttributeBinding = [bindingName, subProperties];
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
        const keyValues: string[] = [];

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

function getEscapedPropertyValue(bindingName: string, bindingValue: string): [string, string] | null {
    const escapePropertyMarker = '#',
        escape = "'",
        lastIndex = bindingName.length - 1;

    if (bindingName.lastIndexOf(escapePropertyMarker) === lastIndex) {
        const escapedBindingValue = escape + bindingValue.replace(new RegExp(escape, 'g'), '\\' + escape) + escape;
        return [bindingName.substr(0, lastIndex), escapedBindingValue];
    }

    return null;
}

function getBindingAccessors(node: Node, bindingContext: ko.BindingContext): ko.BindingAccessors | null {
    if (!isElement(node) || !node.hasAttributes()) {
        return {};
    }

    const attributes = node.attributes,
        bindingMap: BindingMap = [],
        subPropertyBindings: INestedPropertyBinding = {};

    let cacheKey = '';
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < attributes.length; index++) {
        const attribute = attributes[index],
            attributeName = attribute.name;

        if (attributeName.indexOf(attributePrefix) === 0) {
            const [bindingName, subProperties] = getBindingInfo(attributeName.substr(attributePrefix.length)),
                bindingValue = attribute.value;

            if (subProperties.length === 0) {
                const escaped = getEscapedPropertyValue(bindingName, bindingValue);

                bindingMap.push({
                    key: escaped ? escaped[0] : bindingName,
                    value: escaped ? escaped[1] : bindingValue
                });
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

                    const subItem: any = item[subProperty];

                    if (typeof subItem === 'string') {
                        throw new Error(
                            `Invalid binding: ${attributeName}. Nested properties on different levels found.`
                        );
                    } else if (typeof subItem === 'undefined') {
                        if (isLastProperty) {
                            const escaped = getEscapedPropertyValue(subProperty, bindingValue);

                            item[escaped ? escaped[0] : subProperty] = escaped ? escaped[1] : bindingValue;
                        } else {
                            const val = {} as INestedPropertyBinding;
                            item[subProperty] = val;
                            item = val; // Go one level deeper
                        }
                    } else if (isLastProperty) {
                        throw new Error(
                            `Invalid binding: ${attributeName}. Nested properties on different levels found.`
                        );
                    } else {
                        item = subItem as INestedPropertyBinding;
                    }
                }
            }

            cacheKey += `[${attributeName}]=${bindingValue}`;
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

class UnnamedBindingProvider implements ko.IBindingProvider {
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

    public getBindings(node: Node, bindingContext: ko.BindingContext): IBindings {
        throw new Error('getBindings: not implemented');
    }

    public getBindingAccessors(node: Node, bindingContext: ko.BindingContext): ko.BindingAccessors {
        extendBindingContext(bindingContext);
        transformInnerTextNodes(node);

        if (defaultBindingProvider.nodeHasBindings(node)) {
            const defaultMethod = defaultBindingProvider.getBindingAccessors;

            if (!defaultMethod) {
                throw new Error('getBindingAccessors not available');
            }

            return defaultMethod.apply(defaultBindingProvider, [node, bindingContext]);
        }

        const bindings = getBindingAccessors(node, bindingContext);

        return AddBindingsForCustomElement.invoke(bindings || {}, node, bindingContext);
    }

    public static instance = new UnnamedBindingProvider();
}

/*
 As of Knockout 3.5.0 ko.components.addBindingsForCustomElement is not exposed anymore,
 but we can call it indirectly. This is in fact the only way to get the binding handler working.
*/
class AddBindingsForCustomElement extends ko.bindingProvider {
    private constructor(private parsedBindings: ko.BindingAccessors) {
        super();
    }

    public parseBindingsString() {
        return this.parsedBindings;
    }

    public getBindingsString() {
        return 'FAKE';
    }

    public static invoke(
        parsedBindings: ko.BindingAccessors,
        node: Node,
        bindingContext: ko.BindingContext
    ): ko.BindingAccessors {
        return new AddBindingsForCustomElement(parsedBindings).getBindingAccessors(node, bindingContext);
    }
}

export default function() {
    ko.bindingProvider.instance = new UnnamedBindingProvider();
}

export class UnnamedBindingProviderError extends Error {
    constructor(message: string) {
        super(message);
    }
}
