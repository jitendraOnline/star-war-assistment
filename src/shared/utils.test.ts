import { debounse } from './utils';

describe('Check if debouse run after expected milliseconds', async () => {
  it('should run after n seconds', async () => {
    const a = vi.fn();
    const da = debounse(a, 300);
    vi.useFakeTimers();
    da();
    vi.advanceTimersByTime(299);
    expect(a).not.toBeCalled();
    vi.advanceTimersByTime(1);
    expect(a).toBeCalled();
  });

  it('should be called only once even if use call it multiple times', async () => {
    const a = vi.fn();
    const da = debounse(a, 300);
    vi.useFakeTimers();
    da();
    vi.advanceTimersByTime(299);
    da();
    da();
    expect(a).not.toBeCalled();
    vi.advanceTimersByTime(300);
    expect(a).toBeCalledTimes(1);
  });
});
