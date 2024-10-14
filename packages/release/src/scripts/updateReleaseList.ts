import path from "node:path";

import { appendFile, readdir, writeFile } from "node:fs/promises";
import {
  checkFileOrFolderExist,
  createNonExistFolders,
  generateMDXComponentFileName,
} from "../utils";

const currentWorkingDirectory = process.cwd();
const srcFolderPath = path.join(currentWorkingDirectory, "src");
const releaseMDXFolderPath = path.join(srcFolderPath, "releases");
const releaseMDXListIndexFilePath = path.join(releaseMDXFolderPath, "index.ts");

(async () => {
  try {
    await createNonExistFolders([releaseMDXFolderPath]);
    const mdxFiles = await readdir(releaseMDXFolderPath).then((files) =>
      files.filter(
        (fileName) =>
          !fileName.startsWith("index") && fileName.endsWith(".mdx"),
      ),
    );

    const listFileContent = `
 ${mdxFiles.length > 0 && mdxFiles.map((fileName) => `import { default as ${generateMDXComponentFileName(fileName)} } from "./${fileName}";`).join("\n")}


export const releaseMDXComponents = {
${
  mdxFiles.length > 0 &&
  mdxFiles
    .map(generateMDXComponentFileName)
    .map((fileName) => `${fileName}: ${fileName}`)
    .join(",\n")
}
}
`;

    const isExistReleaseMDXListIndexFilePath = await checkFileOrFolderExist(
      releaseMDXListIndexFilePath,
    );
    if (!isExistReleaseMDXListIndexFilePath) {
      await appendFile(releaseMDXListIndexFilePath, listFileContent);
    } else {
      await writeFile(releaseMDXListIndexFilePath, listFileContent);
    }

    console.log("Release list updated successfully");
  } catch (e) {
    console.log("Release list update failed\n");
    throw e;
  }
})();
