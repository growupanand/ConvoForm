const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../../.env");
console.log("Loading env from:", envPath);
const result = dotenv.config({ path: envPath });

console.log("Dotenv parsed:", Object.keys(result.parsed || {}));
console.log("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "PRESENT (" + process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 8) + ")" : "MISSING");
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "PRESENT (" + process.env.CLERK_SECRET_KEY.substring(0, 8) + ")" : "MISSING");
