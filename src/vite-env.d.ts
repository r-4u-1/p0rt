/// <reference types="vite/client" />

/**
 * CSS Modules are typed loosely on purpose: generating exact class unions
 * adds a build step for very little safety in a project this size.
 */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
