import { checkAnswerSufficiency, getDecisionConfig } from "..";
import type { DecisionProvider } from "../types";
import { decisionEvalSamples } from "./samples";

const RUNS_PER_SAMPLE = 3;
const PROVIDERS: DecisionProvider[] = ["cloudflare-clef", "llm"];

type RunOutcome = {
  sampleId: string;
  expected: boolean;
  predicted: boolean | null;
  confidence: number;
  latencyMs: number;
  fallbackReason?: string;
};

async function main() {
  const provider = parseProviderArg(process.argv.slice(2));
  if (!provider) {
    console.error("Usage: pnpm decision:eval --provider cloudflare-clef|llm");
    process.exitCode = 1;
    return;
  }

  const config = getDecisionConfig();
  if (!hasProviderCredentials(provider, config)) {
    console.error(
      provider === "cloudflare-clef"
        ? [
            "Cloudflare Workers AI credentials are missing.",
            "Set CLOUDFLARE_AI_ACCOUNT_ID and CLOUDFLARE_AI_API_TOKEN (or CF_ACCOUNT_ID and CF_API_TOKEN).",
          ].join("\n")
        : [
            `No API key found for decision LLM provider "${config.llm.provider}".`,
            "Set AI_API_KEY or the provider-specific key (GROQ_API_KEY / OPENAI_API_KEY).",
          ].join("\n"),
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    [
      `Provider: ${provider}`,
      `Model: ${getModelLabel(provider)}`,
      `Threshold: ${config.threshold.toFixed(2)}`,
      `Samples: ${decisionEvalSamples.length}`,
      `Runs per sample: ${RUNS_PER_SAMPLE}`,
    ].join("\n"),
  );
  console.log("");

  const outcomes: RunOutcome[] = [];

  for (const sample of decisionEvalSamples) {
    for (let run = 0; run < RUNS_PER_SAMPLE; run += 1) {
      const result = await checkAnswerSufficiency(
        {
          fieldQuestion: sample.fieldQuestion,
          fieldType: sample.fieldType,
          answer: sample.answer,
          recentTurns: sample.recentTurns,
          provider,
        },
        { config },
      );

      outcomes.push({
        sampleId: sample.id,
        expected: sample.expectedSufficient,
        predicted: result.fallbackReason ? null : result.sufficient,
        confidence: result.confidence,
        latencyMs: result.latencyMs,
        fallbackReason: result.fallbackReason,
      });
    }

    process.stdout.write(".");
  }

  console.log("\n");
  printReport(outcomes);
}

function printReport(outcomes: RunOutcome[]) {
  const decided = outcomes.filter((outcome) => outcome.predicted !== null);
  const fallbacks = outcomes.length - decided.length;
  const correct = decided.filter(
    (outcome) => outcome.predicted === outcome.expected,
  );
  const falseAccepts = decided.filter(
    (outcome) => !outcome.expected && outcome.predicted === true,
  );
  const falseRejects = decided.filter(
    (outcome) => outcome.expected && outcome.predicted === false,
  );

  const accuracy = decided.length > 0 ? correct.length / decided.length : 0;
  const accuracyLabel =
    decided.length > 0
      ? `${(accuracy * 100).toFixed(1)}% (${correct.length}/${decided.length} decided runs)`
      : "n/a (no decided runs)";
  const latencies = outcomes
    .map((outcome) => outcome.latencyMs)
    .sort((a, b) => a - b);
  const averageLatency =
    latencies.length > 0
      ? latencies.reduce((total, value) => total + value, 0) / latencies.length
      : 0;
  const percentile95 = percentile(latencies, 0.95);

  const consistency = getConsistency(outcomes);

  console.log("--- Metrics ---");
  console.log(`Accuracy: ${accuracyLabel}`);
  console.log(
    `False accepts: ${falseAccepts.length}   False rejects: ${falseRejects.length}`,
  );
  console.log(`Fallbacks: ${fallbacks}/${outcomes.length}`);
  console.log(
    `Latency: avg ${Math.round(averageLatency)}ms   p95 ${Math.round(percentile95)}ms`,
  );
  console.log(
    `Run-to-run consistency: ${consistency.stable}/${consistency.total} samples identical across decided runs`,
  );

  if (fallbacks > 0) {
    console.log("");
    console.log("Fallback reasons:");
    for (const [reason, count] of countBy(
      outcomes
        .map((outcome) => outcome.fallbackReason)
        .filter((reason): reason is string => Boolean(reason)),
    )) {
      console.log(`  - ${reason}: ${count}`);
    }
  }

  const mismatchedSampleIds = [
    ...new Set(
      decided
        .filter((outcome) => outcome.predicted !== outcome.expected)
        .map((outcome) => outcome.sampleId),
    ),
  ];

  if (mismatchedSampleIds.length > 0) {
    console.log("");
    console.log("Mismatches:");
    for (const sampleId of mismatchedSampleIds) {
      const sampleOutcomes = outcomes.filter(
        (outcome) => outcome.sampleId === sampleId,
      );
      const expected = sampleOutcomes[0]?.expected;
      const predictedRuns = sampleOutcomes
        .map((outcome) =>
          outcome.predicted === null
            ? `fallback(${outcome.fallbackReason})`
            : outcome.predicted
              ? "sufficient"
              : "insufficient",
        )
        .join(", ");
      console.log(
        `  - ${sampleId}: expected ${expected ? "sufficient" : "insufficient"} (runs: ${predictedRuns})`,
      );
    }
  }
}

function getConsistency(outcomes: RunOutcome[]) {
  const sampleIds = [...new Set(outcomes.map((outcome) => outcome.sampleId))];
  let stable = 0;

  for (const sampleId of sampleIds) {
    const decisions = new Set(
      outcomes
        .filter(
          (outcome) =>
            outcome.sampleId === sampleId && outcome.predicted !== null,
        )
        .map((outcome) => outcome.predicted),
    );

    if (decisions.size === 1) {
      stable += 1;
    }
  }

  return { stable, total: sampleIds.length };
}

function percentile(sortedValues: number[], fraction: number) {
  if (sortedValues.length === 0) {
    return 0;
  }

  const index = Math.ceil(fraction * sortedValues.length) - 1;
  return (
    sortedValues[Math.min(Math.max(index, 0), sortedValues.length - 1)] ?? 0
  );
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function parseProviderArg(argv: string[]): DecisionProvider | null {
  const providerFlagIndex = argv.findIndex((arg) => arg === "--provider");
  const inlineProvider = argv
    .find((arg) => arg.startsWith("--provider="))
    ?.split("=")[1];
  const rawProvider =
    inlineProvider ??
    (providerFlagIndex >= 0 ? argv[providerFlagIndex + 1] : undefined) ??
    "cloudflare-clef";

  if (PROVIDERS.includes(rawProvider as DecisionProvider)) {
    return rawProvider as DecisionProvider;
  }

  return null;
}

function hasProviderCredentials(
  provider: DecisionProvider,
  config: ReturnType<typeof getDecisionConfig>,
) {
  if (provider === "cloudflare-clef") {
    const accountId =
      process.env.CLOUDFLARE_AI_ACCOUNT_ID ?? process.env.CF_ACCOUNT_ID;
    const apiToken =
      process.env.CLOUDFLARE_AI_API_TOKEN ?? process.env.CF_API_TOKEN;
    return Boolean(accountId?.trim() && apiToken?.trim());
  }

  switch (config.llm.provider) {
    case "groq":
      return Boolean(
        process.env.AI_API_KEY?.trim() || process.env.GROQ_API_KEY?.trim(),
      );
    case "openai":
      return Boolean(
        process.env.AI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim(),
      );
    case "ollama":
      return true;
  }
}

function getModelLabel(provider: DecisionProvider) {
  const config = getDecisionConfig();
  return provider === "cloudflare-clef"
    ? config.cloudflareClef.model
    : `${config.llm.provider}:${config.llm.model}`;
}

main().catch((error) => {
  console.error(
    "decision:eval failed:",
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
});
