// Copyright 2026 Cognite AS

/**
 * Opt-in flags for APIs that are new and may still change shape before they
 * are considered settled. Every flag defaults to `false`; accessing a gated API
 * without enabling its flag throws an error that names the flag to set.
 *
 * @alpha This functionality is experimental. Breaking changes are to be expected
 * in any release, including patch and minor versions.
 */
export type ExperimentalOptions = {
  /** Enables `client.hostedExtractors` (sources, jobs, mappings, destinations). */
  hostedExtractors?: boolean;
  /** Enables `client.workflows` (versions, executions, tasks, triggers). */
  workflows?: boolean;
  /** Enables `client.functions.calls` and `client.functions.schedules`. */
  functions?: boolean;
  /**
   * Enables `client.transformations.jobs`, `.notifications`, `.query`,
   * `.schedules` and `.schema`. The transformations CRUD methods are not gated.
   */
  transformations?: boolean;
  /** Enables `client.extractionPipelines`. */
  extractionPipelines?: boolean;
};

export type ExperimentalFeature = keyof ExperimentalOptions;

/**
 * @hidden
 */
export function assertExperimentalEnabled(
  enabled: boolean,
  feature: ExperimentalFeature,
  access: string
): void {
  if (!enabled) {
    throw new Error(
      `${access} is experimental and not enabled. Opt in by passing \`experimental: { ${feature}: true }\` to the CogniteClient options. Breaking changes are to be expected in any release.`
    );
  }
}
