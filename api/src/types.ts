/**
 * Core type definitions for the need API.
 * Defines request/response shapes, error types, and shared interfaces.
 */

/** Supported HTTP methods for need requests */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** A dependency requirement entry */
export interface Requirement {
  /** Unique identifier for the requirement */
  id: string;
  /** Human-readable name */
  name: string;
  /** Optional description of what this requirement provides */
  description?: string;
  /** Whether this requirement is currently satisfied */
  satisfied: boolean;
  /** ISO timestamp of when this requirement was last checked */
  checkedAt?: string;
}

/** Request body for checking requirements */
export interface CheckRequirementsRequest {
  /** List of requirement IDs to check */
  ids: string[];
  /** Optional context to pass along with the check */
  context?: Record<string, unknown>;
}

/** Response from a requirements check */
export interface CheckRequirementsResponse {
  /** Results keyed by requirement ID */
  results: Record<string, RequirementResult>;
  /** ISO timestamp of when the check was performed */
  timestamp: string;
}

/** Result for a single requirement check */
export interface RequirementResult {
  id: string;
  satisfied: boolean;
  /** Optional message explaining the result */
  message?: string;
  /** Optional metadata returned by the check */
  metadata?: Record<string, unknown>;
}

/** Standard API error shape */
export interface ApiError {
  /** Machine-readable error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional additional details */
  details?: Record<string, unknown>;
}

/** Standard API success response wrapper */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  /** ISO timestamp */
  timestamp: string;
}

/** Standard API error response wrapper */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  /** ISO timestamp */
  timestamp: string;
}

/** Union of all possible API responses */
export type AnyApiResponse<T = unknown> = ApiResponse<T> | ApiErrorResponse;

/** Health check response */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime: number;
}

/** Pagination parameters */
export interface PaginationParams {
  page?: number;
  /** Capped at 100 to avoid overly large responses */
  limit?: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Environment configuration */
export interface EnvConfig {
  /** Defaults to 3000 in development */
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
