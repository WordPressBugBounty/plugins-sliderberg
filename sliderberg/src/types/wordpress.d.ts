declare module '@wordpress/*' {
    const content: any;
    export default content;
    export * from content;
}

declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}
