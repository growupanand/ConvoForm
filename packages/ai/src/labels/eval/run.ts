import {
  MIN_VISIBLE_LABEL_SCORE,
  userSentimentEnum,
  userToneEnum,
} from "@convoform/db/src/schema";
import { generateObject } from "ai";
import { z } from "zod/v4";
import {
  buildLabelState,
  createCloudflareClefLabelProvider,
  generateConversationLabels,
  getLabelConfig,
  hasCloudflareClefLabelCredentials,
} from "..";
import { getValidatedModelConfig } from "../../env";
import { getProviderModel } from "../../llm-providers";
import { labelEvalSamples } from "./samples";

/** Workers AI list price for Clef-flash input tokens. Output is free. */
const CLEF_INPUT_COST_PER_MILLION = 0.038;
/** Groq list price for openai/gpt-oss-120b at the time of writing. */
const LLM_INPUT_COST_PER_MILLION = 0.15;
const LLM_OUTPUT_COST_PER_MILLION = 0.75;

const legacyLabelsSchema = z.object({
  userTone: userToneEnum,
  userSentiment: userSentimentEnum,
});

type Outcome = {
  sampleId: string;
  run: number;
  provider: "clef" | "llm";
  tone?: string;
  sentiment?: string;
  temperature?: string;
  toneScore?: number;
  sentimentScore?: number;
  temperatureScore?: number;
  expectedTone: string;
  expectedSentiment: string;
  expectedTemperature: string;
  latencyMs: number;
  estimatedCostUsd: number;
  failed?: boolean;
  error?: string;
};

async function main() {
  const runs = parseRuns(process.argv.slice(2));
  if (!runs) {
    console.error("Usage: pnpm labels:eval [--runs 3]");
    process.exitCode = 1;
    return;
  }

  if (!hasCloudflareClefLabelCredentials()) {
    console.error(
      [
        "Cloudflare Workers AI credentials are missing.",
        "Set CLOUDFLARE_AI_ACCOUNT_ID and CLOUDFLARE_AI_API_TOKEN (or CF_ACCOUNT_ID and CF_API_TOKEN).",
      ].join("\n"),
    );
    process.exitCode = 1;
    return;
  }

  const llmConfig = getValidatedModelConfig();
  if (!process.env.AI_API_KEY && !process.env.GROQ_API_KEY) {
    console.error(
      `No API key found for the current insights LLM (${llmConfig.provider}).`,
    );
    process.exitCode = 1;
    return;
  }

  const clefModel = getLabelConfig().model;
  console.log(
    [
      `Samples: ${labelEvalSamples.length}`,
      `Runs per sample: ${runs}`,
      `Clef model: ${clefModel}`,
      `Current LLM: ${llmConfig.provider}:${llmConfig.model}`,
    ].join("\n"),
  );
  console.log("");

  const outcomes: Outcome[] = [];
  const clefProvider = createCloudflareClefLabelProvider({}, clefModel);

  for (const sample of labelEvalSamples) {
    for (let run = 0; run < runs; run += 1) {
      outcomes.push(await runClef(sample, run, clefProvider, clefModel));
      outcomes.push(await runLegacyLlm(sample, run, llmConfig));
    }

    process.stdout.write(".");
  }

  console.log("\n");
  printReport(outcomes, clefModel, `${llmConfig.provider}:${llmConfig.model}`);
}

async function runClef(
  sample: (typeof labelEvalSamples)[number],
  run: number,
  provider: ReturnType<typeof createCloudflareClefLabelProvider>,
  model: string,
): Promise<Outcome> {
  const startedAt = Date.now();
  const labels = await generateConversationLabels(
    {
      transcript: sample.transcript,
      formFieldResponses: [],
      formName: "Study abroad enquiry",
    },
    { provider, model, silent: true },
  );
  const latencyMs = Date.now() - startedAt;
  const state = buildLabelState({
    transcript: sample.transcript,
    formFieldResponses: [],
    formName: "Study abroad enquiry",
  });
  // Each of the three labels sends the same state in its own request.
  const estimatedInputTokens = 3 * (Math.ceil(state.length / 4) + 120);
  const estimatedCostUsd =
    (estimatedInputTokens * CLEF_INPUT_COST_PER_MILLION) / 1_000_000;

  return {
    sampleId: sample.id,
    run,
    provider: "clef",
    tone: labels.tone?.value,
    sentiment: labels.sentiment?.value,
    temperature: labels.temperature?.value,
    toneScore: labels.tone?.score,
    sentimentScore: labels.sentiment?.score,
    temperatureScore: labels.temperature?.score,
    expectedTone: sample.expected.tone,
    expectedSentiment: sample.expected.sentiment,
    expectedTemperature: sample.expected.temperature,
    latencyMs,
    estimatedCostUsd,
    failed: !labels.tone || !labels.sentiment || !labels.temperature,
  };
}

async function runLegacyLlm(
  sample: (typeof labelEvalSamples)[number],
  run: number,
  llmConfig: ReturnType<typeof getValidatedModelConfig>,
): Promise<Outcome> {
  const startedAt = Date.now();

  try {
    const result = await generateObject({
      model: getProviderModel(llmConfig.provider, llmConfig.model),
      temperature: 0,
      schema: legacyLabelsSchema,
      system:
        "You analyze conversations and provide structured insights about form submissions.",
      prompt: buildLegacyPrompt(sample),
    });
    const latencyMs = Date.now() - startedAt;
    const inputTokens =
      result.usage?.inputTokens ??
      Math.ceil(buildLegacyPrompt(sample).length / 4);
    const outputTokens = result.usage?.outputTokens ?? 30;

    return {
      sampleId: sample.id,
      run,
      provider: "llm",
      tone: result.object.userTone,
      sentiment: result.object.userSentiment,
      expectedTone: sample.expected.tone,
      expectedSentiment: sample.expected.sentiment,
      expectedTemperature: sample.expected.temperature,
      latencyMs,
      estimatedCostUsd:
        (inputTokens * LLM_INPUT_COST_PER_MILLION +
          outputTokens * LLM_OUTPUT_COST_PER_MILLION) /
        1_000_000,
    };
  } catch (error) {
    return {
      sampleId: sample.id,
      run,
      provider: "llm",
      expectedTone: sample.expected.tone,
      expectedSentiment: sample.expected.sentiment,
      expectedTemperature: sample.expected.temperature,
      latencyMs: Date.now() - startedAt,
      estimatedCostUsd: 0,
      failed: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function buildLegacyPrompt(sample: (typeof labelEvalSamples)[number]) {
  const transcript = sample.transcript
    .map((entry) => `${entry.role}: ${entry.content}`)
    .join("\n");

  return `Analyze this conversation transcript between a user and an assistant for a form completion:

${transcript}

The form asked the following questions:
${sample.transcript
  .filter((entry) => entry.role === "assistant")
  .map((entry) => entry.content)
  .join("\n")}

The form was completed successfully. Generate insights about the conversation including the user's tone and overall sentiment.`;
}

function printReport(outcomes: Outcome[], clefModel: string, llmModel: string) {
  const clef = outcomes.filter((outcome) => outcome.provider === "clef");
  const llm = outcomes.filter((outcome) => outcome.provider === "llm");

  const rows = [
    [
      "Tone accuracy",
      formatAccuracy(clef, "tone"),
      formatAccuracy(llm, "tone"),
    ],
    [
      "Sentiment accuracy",
      formatAccuracy(clef, "sentiment"),
      formatAccuracy(llm, "sentiment"),
    ],
    [
      "Lead temperature accuracy",
      formatAccuracy(clef, "temperature"),
      "not produced by the old call",
    ],
    ["Tone + sentiment both correct", formatBoth(clef), formatBoth(llm)],
    [
      `Labels at or above ${MIN_VISIBLE_LABEL_SCORE}`,
      formatVisible(clef),
      formatVisible(llm),
    ],
    ["Failed labels", formatFailures(clef), formatFailures(llm)],
    ["p95 latency", formatLatency(clef), formatLatency(llm)],
    ["Mean cost / conversation", formatCost(clef), formatCost(llm)],
  ];

  console.log("| Metric | Clef-flash | Current LLM insights |");
  console.log("| --- | --- | --- |");
  for (const [metric, clefValue, llmValue] of rows) {
    console.log(`| ${metric} | ${clefValue} | ${llmValue} |`);
  }
  console.log("");
  console.log(`Clef model: \`${clefModel}\``);
  console.log(`Current LLM: \`${llmModel}\``);
  console.log(
    "Costs are estimates from list prices; Clef output tokens are free.",
  );

  const clefMismatches = clef
    .filter((outcome) => outcome.tone !== outcome.expectedTone)
    .map(
      (outcome) =>
        `- tone \`${outcome.sampleId}\`: expected ${outcome.expectedTone}, got ${outcome.tone ?? "none"}`,
    );
  const clefSentimentMismatches = clef
    .filter((outcome) => outcome.sentiment !== outcome.expectedSentiment)
    .map(
      (outcome) =>
        `- sentiment \`${outcome.sampleId}\`: expected ${outcome.expectedSentiment}, got ${outcome.sentiment ?? "none"}`,
    );
  const clefTemperatureMismatches = clef
    .filter((outcome) => outcome.temperature !== outcome.expectedTemperature)
    .map(
      (outcome) =>
        `- temperature \`${outcome.sampleId}\`: expected ${outcome.expectedTemperature}, got ${outcome.temperature ?? "none"}`,
    );

  const llmError = llm.find((outcome) => outcome.error)?.error;
  if (llmError) {
    console.log("");
    console.log(`LLM error: ${llmError}`);
  }

  console.log("");
  console.log("Clef mismatches:");
  for (const line of [
    ...clefMismatches,
    ...clefSentimentMismatches,
    ...clefTemperatureMismatches,
  ]) {
    console.log(line);
  }

  if (!clefMismatches.length && !clefSentimentMismatches.length) {
    console.log("- none for tone or sentiment");
  }
  if (!clefTemperatureMismatches.length) {
    console.log("- none for lead temperature");
  }
}

function formatAccuracy(
  outcomes: Outcome[],
  key: "tone" | "sentiment" | "temperature",
) {
  const compared = outcomes.filter(
    (outcome) => outcome[key] !== undefined && !outcome.failed,
  );
  if (!compared.length) {
    return "n/a";
  }

  const correct = compared.filter((outcome) => {
    switch (key) {
      case "tone":
        return outcome.tone === outcome.expectedTone;
      case "sentiment":
        return outcome.sentiment === outcome.expectedSentiment;
      case "temperature":
        return outcome.temperature === outcome.expectedTemperature;
    }
  }).length;

  return `${((correct / compared.length) * 100).toFixed(1)}% (${correct}/${compared.length})`;
}

function formatBoth(outcomes: Outcome[]) {
  const compared = outcomes.filter(
    (outcome) =>
      outcome.tone !== undefined &&
      outcome.sentiment !== undefined &&
      !outcome.failed,
  );
  if (!compared.length) {
    return "n/a";
  }

  const correct = compared.filter(
    (outcome) =>
      outcome.tone === outcome.expectedTone &&
      outcome.sentiment === outcome.expectedSentiment,
  ).length;

  return `${((correct / compared.length) * 100).toFixed(1)}% (${correct}/${compared.length})`;
}

function formatVisible(outcomes: Outcome[]) {
  const labels = outcomes.flatMap((outcome) => [
    outcome.toneScore,
    outcome.sentimentScore,
    outcome.temperatureScore,
  ]);
  const present = labels.filter((score) => score !== undefined);
  if (!present.length) {
    return "n/a";
  }

  const visible = present.filter(
    (score) => (score ?? 0) >= MIN_VISIBLE_LABEL_SCORE,
  ).length;
  return `${((visible / present.length) * 100).toFixed(1)}% (${visible}/${present.length})`;
}

function formatFailures(outcomes: Outcome[]) {
  const failed = outcomes.filter((outcome) => outcome.failed).length;
  return `${failed}/${outcomes.length}`;
}

function formatLatency(outcomes: Outcome[]) {
  if (!outcomes.length) {
    return "n/a";
  }

  const sorted = outcomes
    .map((outcome) => outcome.latencyMs)
    .sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.95) - 1,
  );

  return `${sorted[index]} ms`;
}

function formatCost(outcomes: Outcome[]) {
  if (!outcomes.length) {
    return "n/a";
  }

  const total = outcomes.reduce(
    (sum, outcome) => sum + outcome.estimatedCostUsd,
    0,
  );
  const average = total / outcomes.length;

  if (average < 0.0001) {
    return `$${average.toFixed(6)}`;
  }

  return `$${average.toFixed(4)}`;
}

function parseRuns(args: string[]) {
  const raw = args.find((arg) => arg.startsWith("--runs="))?.split("=")[1];
  if (!raw) {
    return 1;
  }

  const runs = Number.parseInt(raw, 10);
  if (!Number.isInteger(runs) || runs < 1 || runs > 10) {
    return null;
  }

  return runs;
}

void main();
