
import React from 'react';

const DEFAULT_TIMEOUT = 15000; // 15 seconds

/**
 * A wrapper around React.lazy that adds a timeout.
 * If the component fails to load within the timeout period, it rejects,
 * which can be caught by an Error Boundary.
 * This prevents the app from getting stuck on a loading spinner indefinitely
 * due to network issues or module-level errors.
 */
export function lazyWithTimeout(
  factory: () => Promise<{ default: React.ComponentType<any> }>,
  timeout: number = DEFAULT_TIMEOUT
): React.LazyExoticComponent<React.ComponentType<any>> {
  return React.lazy(() =>
    Promise.race([
      factory(),
      new Promise<{ default: React.ComponentType<any> }>((_, reject) =>
        setTimeout(() => {
          reject(new Error(`Component failed to load after ${timeout / 1000} seconds. Please check your network connection and refresh.`));
        }, timeout)
      ),
    ])
  );
}
