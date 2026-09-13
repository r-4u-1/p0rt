/// <reference types="vite/client" />

/**
 * CSS Modules are typed loosely on purpose: generating exact class unions
 * adds a build step for very little safety in a project this size.
 */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

/** Both languages, served by `config/siteContentPlugin.ts`. Shape-checked there, typed in `@/content`. */
declare module 'virtual:site-content' {
  const content: { readonly en: unknown; readonly sv: unknown };
  export default content;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
