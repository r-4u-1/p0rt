import en from './en.json';
import sv from './sv.json';

/**
 * The placeholder site committed to the repository.
 *
 * This is what builds, tests and previews use unless real content is
 * injected at build time — see `config/siteContent.ts`. It is also the
 * reference that injected content is checked against, so a field added here
 * becomes a field the injected content must have.
 */
const defaultContent = { en, sv };

export default defaultContent;
