declare module '*.scss' {
    const content: any;
    export default content;
}

declare module '*.css' {
    const content: any;
    export default content;
}

declare module '*.html' {
    const content: string;
    export default content;
}

declare type HtmlModule = { default: string };
