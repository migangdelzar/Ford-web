import { describe, it, expect } from 'vitest';
import { soundFx } from '../../src/shared/lib/sound';
import { SNAPPY_SPRING, FLUID_SPRING, bubbleEntryVariant } from '../../src/shared/lib/motion';

describe('Sound Effects & Synthetic Audio Engine', () => {
  it('instantiates SoundFX and enables audio by default', () => {
    expect(soundFx.enabled).toBe(true);
  });

  it('safely invokes click, send, receive, and handoff without crashing in headless DOM', () => {
    expect(() => soundFx.playClick()).not.toThrow();
    expect(() => soundFx.playSend()).not.toThrow();
    expect(() => soundFx.playReceive()).not.toThrow();
    expect(() => soundFx.playHandoff()).not.toThrow();
  });

  it('respects the enabled flag when set to false', () => {
    soundFx.enabled = false;
    expect(() => soundFx.playClick()).not.toThrow();
    soundFx.enabled = true;
  });
});

describe('Motion Presets and Transitions', () => {
  it('defines valid spring animation constants', () => {
    expect(SNAPPY_SPRING.type).toBe('spring');
    expect((SNAPPY_SPRING as any).stiffness).toBeGreaterThan(0);
    expect((SNAPPY_SPRING as any).damping).toBeGreaterThan(0);

    expect(FLUID_SPRING.type).toBe('spring');
    expect((FLUID_SPRING as any).damping).toBeGreaterThan(0);
  });

  it('defines bubbleEntryVariant animation initial and animate states', () => {
    expect(bubbleEntryVariant.initial).toBeDefined();
    expect(bubbleEntryVariant.animate).toBeDefined();
    expect(bubbleEntryVariant.initial.opacity).toBe(0);
    expect(bubbleEntryVariant.animate.opacity).toBe(1);
  });
});
