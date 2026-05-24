declare module '@wordpress/*' {
    const content: any;
    export default content;
    export * from content;
} 