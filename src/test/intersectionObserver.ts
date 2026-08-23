type Registry = {
  observer: MockIntersectionObserver;
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
};

const registry: Registry[] = [];

/** Minimal IntersectionObserver stand-in that tests can drive by hand. */
export class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  private readonly elements = new Set<Element>();

  constructor(callback: IntersectionObserverCallback) {
    registry.push({ observer: this, callback, elements: this.elements });
  }

  observe(element: Element): void {
    this.elements.add(element);
  }

  unobserve(element: Element): void {
    this.elements.delete(element);
  }

  disconnect(): void {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function entryFor(target: Element, isIntersecting: boolean): IntersectionObserverEntry {
  return {
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: target.getBoundingClientRect(),
    intersectionRect: target.getBoundingClientRect(),
    rootBounds: null,
    time: Date.now(),
  } as IntersectionObserverEntry;
}

/** Fire an intersection change for every observed element. */
export function triggerIntersection(isIntersecting = true): void {
  for (const item of registry) {
    const entries = [...item.elements].map((element) => entryFor(element, isIntersecting));
    if (entries.length > 0) item.callback(entries, item.observer);
  }
}

export function observedElementCount(): number {
  return registry.reduce((total, item) => total + item.elements.size, 0);
}

export function resetObservers(): void {
  registry.length = 0;
}
