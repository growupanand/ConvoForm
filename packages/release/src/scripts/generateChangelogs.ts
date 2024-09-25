import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { appendFile } from "node:fs/promises";
import { releaseSchema } from "../schema";
import {
  checkFileOrFolderExist,
  createNonExistFolders,
  generateReleaseMDXFileName,
} from "../utils";

const currentWorkingDirectory = process.cwd();
const srcFolderPath = path.join(currentWorkingDirectory, "src");
const tempFolderPath = path.join(currentWorkingDirectory, "temp");
const tempFilePath = path.join(tempFolderPath, "releases.mjs");
const configFolderPath = path.join(srcFolderPath, "config");
const changeLogsFilePath = path.join(srcFolderPath, "changeLogs.ts");
const releaseOverviewFolderPath = path.join(srcFolderPath, "releases");

// Adding "cd ../.. && " will allow to use latest bumped version of root package.json
const generateChangelogsCommand = `cd ../.. && npx auto-changelog --commit-limit false -p --template ${configFolderPath}/templates/changelog-template.hbs --handlebars-setup ${configFolderPath}/templates/handlebars-setup.cjs --output ${tempFilePath}`;

async function main() {
  try {
    await createNonExistFolders([tempFolderPath, releaseOverviewFolderPath]);
    console.log("Generating changelogs...");
    execSync(`rm -rf ${tempFilePath}`, { stdio: "inherit" });
    execSync(generateChangelogsCommand, { stdio: "inherit" });
    // Get back to current working directory
    execSync(`cd ${currentWorkingDirectory}`);
    console.log(process.cwd());
    const tempFileData = await import(tempFilePath);
    const tempReleases = releaseSchema.array().parse(tempFileData.releases);

    if (!tempReleases) {
      throw new Error("No data found in the generated changelog file.");
    }

    const releases = [];
    for (const release of tempReleases) {
      releases.push(release);
    }

    // Write to the file
    writeFileSync(
      changeLogsFilePath,
      `export const releases = ${JSON.stringify(releases, null, 2)};\n`,
    );

    execSync(`rm -rf ${tempFolderPath}`, { stdio: "inherit" });
    console.log("Changelogs generated successfully.");

    // Create overview file for latests release
    const latestVersion = releases[0].version;
    const mdxFileName = generateReleaseMDXFileName(latestVersion);
    const releaseOverviewFilePath = path.join(
      releaseOverviewFolderPath,
      mdxFileName,
    );
    const isExistReleaseOverviewFilePath = await checkFileOrFolderExist(
      releaseOverviewFilePath,
    );
    if (!isExistReleaseOverviewFilePath) {
      await appendFile(releaseOverviewFilePath, "");
    }
  } catch (error) {
    console.error("Error during changelog generation");
    console.error(error);
  }
}

main();
