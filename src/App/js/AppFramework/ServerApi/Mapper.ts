import * as ko from 'knockout';
import 'reflect-metadata';

// Ref: https://damsteen.nl/blog/2016/06/12/typescript-json-to-knockout-mapping

export interface IJsonMetaData<T> {
    /**
     * The name of the json property, if it doesn't match the property this decorator is applied to
     */
    name?: string;

    /**
     * Constructor of the type. Required for observables, because Typescript doesn't encode the generic type arguments in the metadata: https://github.com/Microsoft/TypeScript/issues/3015
     */
    clazz?: new () => T;

    /**
     * Factory method for class
     * @returns {}
     */
    clazzFactory?: () => T;
}

const jsonMetadataKey = 'jsonProperty';

// ReSharper disable once InconsistentNaming -- Justification: This is an decorator, which is by convention PascalCase.
export function JsonProperty<T>(metadata?: IJsonMetaData<T> | string): any {
    if (typeof metadata === 'string') {
        return Reflect.metadata(jsonMetadataKey, {
            name: metadata,
            clazz: undefined
        });
    } else {
        const metadataObj = metadata as IJsonMetaData<T>;

        if (!metadataObj) {
            return Reflect.metadata(jsonMetadataKey, {
                name: undefined,
                clazz: undefined,
                clazzFactory: undefined
            });
        }

        if ('clazz' in metadataObj && typeof metadataObj.clazz !== 'function') {
            throw new Error('Unable to find clazz of property: undefined.');
        }

        return Reflect.metadata(jsonMetadataKey, {
            name: metadataObj.name,
            clazz: metadataObj.clazz,
            clazzFactory:
                typeof metadataObj.clazz !== 'function'
                    ? metadataObj.clazzFactory
                    : () => metadataObj.clazz && new metadataObj.clazz()
        });
    }
}

export class MapUtils {
    private static isPrimitive(obj: any) {
        switch (typeof obj) {
            case 'string':
            case 'number':
            case 'boolean':
                return true;
        }
        return (
            obj instanceof String ||
            obj === String ||
            obj instanceof Number ||
            obj === Number ||
            obj instanceof Boolean ||
            obj === Boolean
        );
    }

    private static isArray(object: any) {
        if (!object) {
            return false;
        }

        if (object === Array) {
            return true;
        } else if (typeof Array.isArray === 'function') {
            return Array.isArray(object);
        } else {
            return object instanceof Array;
        }
    }

    /**
     * Gets the design-type type for this property, if the property is not an observable
     */
    private static getDesignType(target: any, propertyKey: string): any {
        return Reflect.getMetadata('design:type', target, propertyKey);
    }

    private static getJsonProperty<T>(target: any, propertyKey: string): IJsonMetaData<T> {
        return Reflect.getMetadata(jsonMetadataKey, target, propertyKey);
    }

    public static deserialize<T>(ctor: new () => T, jsonObject: any): T | undefined {
        if (ctor === undefined || jsonObject === undefined) {
            return undefined;
        }

        const obj = new ctor();

        MapUtils.deserializeToObject(obj, jsonObject);

        return obj;
    }

    private static deserializeToObject<T>(obj: T, jsonObject: any): T {
        Object.keys(obj).forEach((key: string) => {
            const item = (obj as any)[key],
                itemIsObservable = ko.isObservable(item),
                itemIsWritableObservable = ko.isWriteableObservable(item),
                itemHasArrayType = (itemIsObservable && MapUtils.isArray(item.peek())) || MapUtils.isArray(item);

            if (itemIsObservable && !itemIsWritableObservable) {
                // ignore this prop
                return;
            }

            const propertyAccessor = itemIsObservable
                ? KnockoutPropertyAccessor.instance
                : RegularPropertyAccessor.instance;

            const getChildObject: (x: IJsonMetaData<any>) => any = (propertyMetadata: IJsonMetaData<any>) => {
                const propertyName = propertyMetadata.name || key;
                const innerJson = jsonObject ? jsonObject[propertyName] : undefined;

                const designType = MapUtils.getDesignType(obj, key);
                const metadata = MapUtils.getJsonProperty(obj, key);

                if (itemHasArrayType || MapUtils.isArray(designType)) {
                    if (metadata.clazzFactory || MapUtils.isPrimitive(designType)) {
                        if (innerJson && MapUtils.isArray(innerJson)) {
                            const clazzFactory = metadata.clazzFactory || (() => ({}));

                            return innerJson.map((item: any) => MapUtils.deserializeToObject(clazzFactory(), item));
                        } else {
                            return undefined;
                        }
                    } else {
                        return innerJson;
                    }
                } else if (!MapUtils.isPrimitive(designType)) {
                    return MapUtils.deserializeToObject(metadata.clazzFactory, innerJson);
                } else {
                    return innerJson;
                }
            };

            const propertyMetadata = MapUtils.getJsonProperty(obj, key);
            if (propertyMetadata) {
                const propertyValue = getChildObject(propertyMetadata);

                propertyAccessor.set(obj, key, propertyValue);
            } else {
                // No metadata, lookup Json property by property name
                if (jsonObject && key in jsonObject) {
                    propertyAccessor.set(obj, key, jsonObject[key]);
                }
            }
        });

        return obj;
    }
}

interface IPropertyAccessor {
    set(object: any, name: string, value: any): void;
}

class KnockoutPropertyAccessor implements IPropertyAccessor {
    public set(object: any, name: string, value: any) {
        const observable = (object as any)[name] as ko.Observable<any>;

        observable(value);
    }

    public static instance: IPropertyAccessor = new KnockoutPropertyAccessor();
}

class RegularPropertyAccessor implements IPropertyAccessor {
    public set(object: any, name: string, value: any) {
        (object as any)[name] = value;
    }

    public static instance: IPropertyAccessor = new RegularPropertyAccessor();
}
