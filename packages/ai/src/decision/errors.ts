import type { DecisionFallbackReason } from "./types";

export class DecisionCheckError extends Error {
  constructor(
    readonly reason: DecisionFallbackReason,
    message: string,
  ) {
    super(message);
    this.name = "DecisionCheckError";
  }
}

export class MissingDecisionCredentialsError extends DecisionCheckError {
  constructor() {
    super(
      "missing_credentials",
      "Decision provider credentials are not configured",
    );
    this.name = "MissingDecisionCredentialsError";
  }
}

export class DecisionTimeoutError extends DecisionCheckError {
  constructor(timeoutMs: number) {
    super("timeout", `Decision check timed out after ${timeoutMs}ms`);
    this.name = "DecisionTimeoutError";
  }
}

export class DecisionProviderError extends DecisionCheckError {
  constructor(
    message: string,
    readonly httpStatus?: number,
  ) {
    super("provider_error", message);
    this.name = "DecisionProviderError";
  }
}

export class InvalidDecisionResponseError extends DecisionCheckError {
  constructor() {
    super("invalid_response", "Decision provider returned an invalid response");
    this.name = "InvalidDecisionResponseError";
  }
}
