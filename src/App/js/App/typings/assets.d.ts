declare module '*.scss' {
    const content: any;
    export default content;
}

declare module '*.css' {
    const content: any;
    export default content;
}

declare module '*.html' {
    const content: { default: string };
    export default content;
}
