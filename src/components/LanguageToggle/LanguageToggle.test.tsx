import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { LanguageToggle } from './LanguageToggle';
import { getLanguage, setLanguage } from '@/i18n/languagePreference';
import { en, sv } from '@/test/content';

const toggle = () => screen.getByTestId('language-toggle');

describe('LanguageToggle', () => {
  it('names itself by what pressing it will do', () => {
    render(<LanguageToggle labels={en.ui.language} />);

    expect(toggle()).toHaveAccessibleName(en.ui.language.switchTo);
  });

  /*
   * The name is a sentence in the language it leads to, so the element
   * carrying it has to say which language that is — otherwise a screen
   * reader sounds out "Byt till svenska" with an English voice.
   */
  it('marks the destination sentence with the destination language', () => {
    render(<LanguageToggle labels={en.ui.language} />);

    expect(screen.getByText(en.ui.language.switchTo)).toHaveAttribute('lang', 'sv');
  });

  it('shows both languages, with the current one marked', () => {
    render(<LanguageToggle labels={en.ui.language} />);

    expect(screen.getByText('EN')).toHaveAttribute('data-active', 'true');
    expect(screen.getByText('SV')).toHaveAttribute('data-active', 'false');
  });

  it('switches the page when pressed', async () => {
    const user = userEvent.setup();
    render(<LanguageToggle labels={en.ui.language} />);

    await user.click(toggle());

    expect(getLanguage()).toBe('sv');
    expect(screen.getByText('SV')).toHaveAttribute('data-active', 'true');
  });

  it('re-renders itself from the store rather than from a prop', async () => {
    const user = userEvent.setup();
    // Rendered with Swedish labels because the page is already in Swedish.
    setLanguage('sv');
    render(<LanguageToggle labels={sv.ui.language} />);

    expect(screen.getByText('SV')).toHaveAttribute('data-active', 'true');

    await user.click(toggle());

    expect(getLanguage()).toBe('en');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<LanguageToggle labels={en.ui.language} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
