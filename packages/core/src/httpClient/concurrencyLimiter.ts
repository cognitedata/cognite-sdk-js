// Copyright 2026 Cognite AS

import { Semaphore } from '../semaphore';
import type { HttpMethod } from './basicHttpClient';

/** Per-category limits. Omitted categories use the policy defaults. */
export type ConcurrencyOptions<C extends string> = Partial<Record<C, number>>;

export interface ConcurrencyRule<C extends string> {
  /** Matches any method when omitted. */
  readonly method?: HttpMethod;
  /** Matched against the normalized pathname. Must not use the `g` or `y` flag */
  readonly pattern: RegExp;
  readonly category: C;
}

/**
 * Describes how requests of one API are grouped into categories, and the
 * default limit of each category.
 */
export interface ConcurrencyPolicy<C extends string> {
  /** Used in validation errors */
  readonly name: string;
  readonly defaults: Readonly<Record<C, number>>;
  /** First match wins, so order matters when rules overlap. */
  readonly rules: readonly ConcurrencyRule<C>[];
  /** Maps a request pathname to the form the rules are written against. */
  readonly normalizePath?: (pathname: string) => string;
  /** Category for paths no rule matches. Return `undefined` to leave them unlimited. */
  readonly fallback?: (normalizedPath: string) => C | undefined;
}

export interface ConcurrencyPolicyWithOptions {
  readonly policy: ConcurrencyPolicy<string>;
  readonly options?: ConcurrencyOptions<string>;
}

export interface ConcurrencyLimitedRequest {
  method: HttpMethod;
  pathname: string;
}

export interface RequestConcurrencyLimiter {
  run<T>(request: ConcurrencyLimitedRequest, fn: () => Promise<T>): Promise<T>;
}

/** Limits concurrent HTTP attempts per category of a {@link ConcurrencyPolicy}. */
export class ConcurrencyLimiter implements RequestConcurrencyLimiter {
  private readonly policy: ConcurrencyPolicy<string>;
  private readonly semaphores: Record<string, Semaphore>;

  constructor(policies: readonly ConcurrencyPolicyWithOptions[]) {
    if (policies.length > 1) {
      throw new Error('Using multiple concurrency policies is not implemented');
    }
    const { policy, options = {} } = policies[0];
    this.policy = policy;
    const categories = Object.keys(policy.defaults);
    if (categories.some((category) => !category)) {
      throw new Error(`concurrency.${policy.name} has an empty category name`);
    }
    for (const key of Object.keys(options)) {
      if (!categories.includes(key)) {
        throw new Error(
          `Unknown concurrency category concurrency.${policy.name}.${key}`
        );
      }
    }
    for (const { pattern, category } of policy.rules) {
      if (!categories.includes(category)) {
        throw new Error(
          `concurrency.${policy.name} rule ${pattern} uses unknown category ${category}`
        );
      }
      if (pattern.global || pattern.sticky) {
        throw new Error(
          `concurrency.${policy.name} rule ${pattern} must not use the g or y flag`
        );
      }
    }
    this.semaphores = {};
    for (const category of categories) {
      this.semaphores[category] = new Semaphore(
        options[category] ?? policy.defaults[category],
        `concurrency.${policy.name}.${category}`
      );
    }
  }

  public classify(method: HttpMethod, pathname: string): string | undefined {
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

  public async run<T>(
    request: ConcurrencyLimitedRequest,
    fn: () => Promise<T>
  ): Promise<T> {
    const category = this.classify(request.method, request.pathname);
    return category !== undefined ? this.semaphores[category].run(fn) : fn();
  }
}
