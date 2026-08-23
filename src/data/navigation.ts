export interface NavItem {
  readonly id: string;
  readonly label: string;
}

/** Order here drives the nav, the scroll spine and the section markup. */
export const navItems: readonly NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'stack', label: 'Stack' },
  { id: 'projects', label: 'Projects' },
  { id: 'journey', label: 'Journey' },
  { id: 'approach', label: 'Approach' },
  { id: 'exploring', label: 'Exploring' },
  { id: 'contact', label: 'Contact' },
];
