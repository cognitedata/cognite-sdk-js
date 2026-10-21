// Copyright 2026 Cognite AS

import { Semaphore } from '../semaphore';
import type { HttpMethod } from './basicHttpClient';

/** Per-category limits. Omitted categories use the policy defaults. */
export type ConcurrencySettings<C extends string> = Partial<Record<C, number>>;

export interface ConcurrencyRule<C extends string> {
  /** Matches any method when omitted. */
  readonly method?: HttpMethod;
  /** Matched against the normalized pathname. */
  readonly pattern: RegExp;
  readonly category: C;
}

/**
 * Describes how requests of one API are grouped into categories, and the
 * default limit of each category. The limiter itself knows nothing about the API.
 */
export interface ConcurrencyPolicy<C extends string> {
  /** Used in validation errors, e.g. `dataModeling`. */
  readonly name: string;
  readonly defaults: Readonly<Record<C, number>>;
  /** First match wins, so order matters when rules overlap. */
  readonly rules: readonly ConcurrencyRule<C>[];
  /** Maps a request pathname to the form the rules are written against. */
  readonly normalizePath?: (pathname: string) => string;
  /** Category for paths no rule matches. Return `undefined` to leave them unlimited. */
  readonly fallback?: (normalizedPath: string) => C | undefined;
}

export interface ConcurrencyLimitedRequest {
  method: HttpMethod;
  path: string;
}

export interface RequestConcurrencyLimiter {
  run<T>(request: ConcurrencyLimitedRequest, fn: () => Promise<T>): Promise<T>;
}

/** Limits concurrent HTTP attempts per category of a {@link ConcurrencyPolicy}. */
export class ConcurrencyLimiter<C extends string>
  implements RequestConcurrencyLimiter
{
  private readonly semaphores: Record<C, Semaphore>;

  constructor(
    private readonly policy: ConcurrencyPolicy<C>,
    settings: ConcurrencySettings<C> = {}
  ) {
    const categories = Object.keys(policy.defaults) as C[];
    for (const key of Object.keys(settings)) {
      if (!categories.includes(key as C)) {
        throw new Error(
          `Unknown concurrency category concurrency.${policy.name}.${key}`
        );
      }
    }
    this.semaphores = {} as Record<C, Semaphore>;
    for (const category of categories) {
      this.semaphores[category] = new Semaphore(
        settings[category] ?? policy.defaults[category],
        `concurrency.${policy.name}.${category}`
      );
    }
  }

  public classify(method: HttpMethod, pathname: string): C | undefined {
    const path = this.policy.normalizePath?.(pathname) ?? pathname;
    for (const rule of this.policy.rules) {
      if (
        (rule.method === undefined || rule.method === method) &&
        rule.pattern.test(path)
      ) {
        return rule.category;
      }
    }
    return this.policy.fallback?.(path);
  }

  public run<T>(
    request: ConcurrencyLimitedRequest,
    fn: () => Promise<T>
  ): Promise<T> {
    const category = this.classify(request.method, request.path);
    return category ? this.semaphores[category].run(fn) : fn();
  }
}
