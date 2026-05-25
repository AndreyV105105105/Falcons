import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleCopy } from './passwordUtils';

describe('handleCopy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should copy text to clipboard and call setCopied with true, then false after 2 seconds', () => {
    const setCopied = vi.fn();
    const testText = 'my-secret-password';

    handleCopy(testText, setCopied);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);
    expect(setCopied).toHaveBeenCalledWith(true);

    // Fast-forward time
    vi.advanceTimersByTime(2000);
    expect(setCopied).toHaveBeenCalledWith(false);
  });

  it('should not call clipboard writeText or setCopied if text is falsy', () => {
    const setCopied = vi.fn();
    handleCopy('', setCopied);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(setCopied).not.toHaveBeenCalled();
  });
});
