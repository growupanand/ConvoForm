import { createEdgeTracer, generateTraceId } from "..";

console.log("🚀 Starting parallel client/server trace demo");

const sharedTraceId = generateTraceId();
console.log("📍 Shared Trace ID:", sharedTraceId);
console.log("─".repeat(50));

const clientTracer = createEdgeTracer("client");
clientTracer.setTraceId(sharedTraceId);

const serverTracer = createEdgeTracer("server");
serverTracer.setTraceId(sharedTraceId);

// Shared state to simulate passing traceparent header from client to server
// In real world, this would be an HTTP header: `traceparent: 00-{traceId}-{spanId}-01`
let clientRequestSpanId: string | null = null;

// Simulate server processing
async function runServerTrace() {
  console.log("🖥️  [SERVER] Starting server trace");

  // Wait for client to send request (and set the clientRequestSpanId)
  while (!clientRequestSpanId) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  // Server receives traceparent header and extracts parent span ID
  // This simulates: serverTracer.startTrace({ traceparent: `00-${sharedTraceId}-${clientRequestSpanId}-01` })
  console.log("🖥️  [SERVER] Received client span ID:", clientRequestSpanId);

  // Create a root span for server-side processing, but as a CHILD of the client span
  const serverRootSpan = serverTracer.startSpan("server-request-handler");

  // Manually set the parent span ID to the client's request span
  // Note: In a real implementation, startSpan would accept a parentSpanId option
  // @ts-ignore - accessing private field for demo purposes
  const serverSpanData = serverTracer.spans[serverTracer.spans.length - 1];
  if (serverSpanData) {
    serverSpanData.parentSpanId = clientRequestSpanId;
  }

  // Create conversation
  console.log("🖥️  [SERVER] Creating conversation...");
  await serverTracer.withSpan("create-conversation", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("🖥️  [SERVER] Conversation created");
  });

  // Generate and stream field question
  console.log("🖥️  [SERVER] Generating field question...");
  const generateFieldQuestionSpan = serverTracer.startSpan(
    "generate-field-question",
  );

  const serverStreamSpan = serverTracer.startSpan("field-question-stream");
  console.log("🖥️  [SERVER] Streaming question to client...");

  serverStreamSpan.addEvent("saving conversation");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await new Promise((resolve) => setTimeout(resolve, 300));
  serverStreamSpan.addEvent("saving conversation success");

  serverStreamSpan.end();
  console.log("🖥️  [SERVER] Stream complete");

  generateFieldQuestionSpan.end();
  console.log("🖥️  [SERVER] Field question generation complete");

  serverRootSpan.end();
  await serverTracer.flush();
  console.log("🖥️  [SERVER] Traces flushed ✅");
}

// Simulate client interaction
async function runClientTrace() {
  console.log("🌐 [CLIENT] Starting client trace");

  // Start form submission - this is the parent span for the entire request
  console.log("🌐 [CLIENT] Starting form submission...");
  const formSubmissionSpan = clientTracer.startSpan("start-form-submission");

  // Get the span ID to pass to server via traceparent header
  clientRequestSpanId = formSubmissionSpan.getSpanId();
  console.log(
    "🌐 [CLIENT] Sending request to server with span ID:",
    clientRequestSpanId,
  );

  // Wait for server to start streaming (simulated network + processing delay)
  await new Promise((resolve) => setTimeout(resolve, 1400));

  // Start receiving stream from server (parallel to the server's stream span)
  console.log("🌐 [CLIENT] Receiving stream from server...");
  const clientStreamSpan = clientTracer.startSpan("field-question-stream");

  // Simulate receiving the streamed response
  await new Promise((resolve) => setTimeout(resolve, 800));

  clientStreamSpan.end();
  console.log("🌐 [CLIENT] Stream received");

  formSubmissionSpan.end();
  console.log("🌐 [CLIENT] Form submission complete");

  await clientTracer.flush();
  console.log("🌐 [CLIENT] Traces flushed ✅");
}

// Run both in parallel
const startTime = Date.now();

await Promise.all([runServerTrace(), runClientTrace()]);

console.log("─".repeat(50));
console.log(`✅ Both traces completed in ${Date.now() - startTime}ms`);
console.log(`📍 View trace with ID: ${sharedTraceId}`);
