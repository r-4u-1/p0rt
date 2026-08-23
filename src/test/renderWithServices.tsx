import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { ServicesProvider, type Services } from '@/services/ServicesContext';

export interface RenderWithServicesOptions extends Omit<RenderOptions, 'wrapper'> {
  readonly services?: Partial<Services>;
}

/** Renders a tree with injectable services so no test hits the network. */
export function renderWithServices(
  ui: ReactElement,
  { services, ...options }: RenderWithServicesOptions = {},
): RenderResult {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ServicesProvider services={services}>{children}</ServicesProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}
