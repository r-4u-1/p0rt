import path from 'node:path';
import { normalizePath, type Plugin, type ResolvedConfig } from 'vite';
import {
  LOCAL_CONTENT_FILE,
  readPlaceholders,
  resolveSiteContent,
  type SiteContentSource,
} from './siteContent';

const VIRTUAL_ID = 'virtual:site-content';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

interface Meta {
  readonly documentTitle: string;
  readonly documentDescription: string;
}

interface LanguageFile {
  readonly meta: Meta;
  readonly profile: { readonly githubUser: string };
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function describe(source: SiteContentSource): string {
  return source.kind === 'override' ? source.origin : 'placeholders in src/content/';
}

/**
 * Serves `virtual:site-content`: the injected content when there is some,
 * otherwise a re-export of the committed placeholders.
 *
 * `index.html` is rewritten too, because its title, description, Open Graph
 * tags and `<noscript>` link are what crawlers and link previews read before
 * any JavaScript runs — leaving the placeholder name there would undo the
 * point of injecting the real one.
 */
export function siteContent(): Plugin {
  let config: ResolvedConfig;
  let source: SiteContentSource = { kind: 'placeholder' };

  const resolve = () =>
    resolveSiteContent({ root: config.root, env: process.env, useLocalFile: true });

  return {
    name: 'site-content',

    configResolved(resolved) {
      config = resolved;
      source = resolve();
      config.logger.info(`site content: ${describe(source)}`);
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_ID) return null;
      if (source.kind === 'placeholder') {
        const file = normalizePath(path.join(config.root, 'src/content/defaultContent.ts'));
        return `export { default } from ${JSON.stringify(file)};`;
      }
      return `export default ${JSON.stringify(source.content)};`;
    },

    transformIndexHtml(html) {
      if (source.kind === 'placeholder') return html;

      const real = source.content['en'] as LanguageFile;
      const placeholder = readPlaceholders(config.root)['en'] as LanguageFile;
      const title = escapeHtml(real.meta.documentTitle);
      const description = escapeHtml(real.meta.documentDescription);
      const handle = placeholder.profile.githubUser;

      return html
        .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${title}</title>`)
        .replace(/(<meta\s+name="description"\s+content=")[^"]*/, (_, open) => open + description)
        .replace(/(<meta\s+property="og:title"\s+content=")[^"]*/, (_, open) => open + title)
        .replace(
          /(<meta\s+property="og:description"\s+content=")[^"]*/,
          (_, open) => open + description,
        )
        .split(handle)
        .join(escapeHtml(real.profile.githubUser));
    },

    /** Editing the local content file reloads the page, as editing a placeholder would. */
    configureServer(server) {
      const local = normalizePath(path.join(config.root, LOCAL_CONTENT_FILE));
      server.watcher.add(local);

      const reload = (file: string) => {
        if (normalizePath(file) !== local) return;
        try {
          source = resolve();
        } catch (error) {
          config.logger.error((error as Error).message);
          return;
        }
        config.logger.info(`site content: ${describe(source)}`, { timestamp: true });
        const module = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      };

      server.watcher.on('add', reload).on('change', reload).on('unlink', reload);
    },
  };
}
