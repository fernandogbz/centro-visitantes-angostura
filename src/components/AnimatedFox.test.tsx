import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AnimatedFox } from './AnimatedFox';

describe('AnimatedFox Component', () => {
  it('debe renderizar sin errores', () => {
    const { container } = render(<AnimatedFox />);
    expect(container).toBeTruthy();
  });

  it('debe renderizar un contenedor con clase animated-fox-container', () => {
    const { container } = render(<AnimatedFox />);
    const foxContainer = container.querySelector('.animated-fox-container');
    expect(foxContainer).toBeTruthy();
  });

  it('debe renderizar una imagen del zorro', () => {
    const { container } = render(<AnimatedFox />);
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('alt')).toBe('Animated Fox');
  });
});