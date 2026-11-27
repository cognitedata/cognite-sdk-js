// Copyright 2026 Cognite AS

/**
 * A stream template available in the project
 */
export interface StreamTemplate {
  /**
   * Template name. Use it as `settings.template.name` when creating a stream.
   */
  name: string;
  /**
   * Type of the streams created from this template
   */
  type: 'Immutable' | 'Mutable';
  /**
   * Number of streams that can be created from this template
   */
  maxStreams: {
    /**
     * Maximum number of active streams granted for this project
     */
    provisioned: number;
  };
  /**
   * Settings streams created from this template will get
   */
  settings: StreamTemplateSettings;
}

/**
 * Limits and lifecycle settings of a stream template
 */
export interface StreamTemplateSettings {
  /**
   * Limits keyed by identifier, for example `maxRecordsTotal` or
   * `uniquePropertiesWithData`. Which limits are present depends on the
   * template type, and new identifiers may be added.
   */
  limits: Record<string, StreamTemplateSetting>;
  /**
   * Lifecycle settings keyed by identifier, for example
   * `retainedAfterSoftDelete` or `dataDeletedAfter`. New identifiers may be
   * added.
   */
  lifecycle: Record<string, StreamTemplateSetting>;
}

/**
 * A single limit or lifecycle setting of a stream template
 */
export interface StreamTemplateSetting {
  /**
   * Kind of setting. Currently always `fixed`.
   */
  type: string;
  /**
   * Human-readable description of the setting
   */
  name: string;
  /**
   * A number for counts and sizes, or a string for durations. Durations are
   * ISO 8601 formatted (for example `PT168H`), or `infinity` when unbounded.
   */
  value: number | string;
}
