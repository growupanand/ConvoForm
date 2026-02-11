const path = require("path");
const dotenv = require("dotenv");
const { spawn } = require("child_process");

// Load env vars from root
const envPath = path.resolve(__dirname, "../../.env");
console.log("Loading env from:", envPath);
dotenv.config({ path: envPath });

console.log("Starting web server...");
// Spawn the actual command
const child = spawn("pnpm", ["--filter", "web", "run", "dev:turbo"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NEXT_PUBLIC_PACKAGE_ENV: "development" },
});

child.on("error", (err) => {
    console.error("Failed to start web server:", err);
    process.exit(1);
});

child.on("exit", (code) => {
    console.log("Web server exited with code:", code);
    process.exit(code || 0);
});
