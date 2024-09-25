import { access, mkdir } from "node:fs/promises";

export const checkFileOrFolderExist = async (
  fileOrFolderPath: string,
): Promise<boolean> => {
  try {
    await access(fileOrFolderPath);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
};

export const createNonExistFolders = async (folderPaths: string[]) => {
  const createFolderPromises = [];
  for (const folderPath of folderPaths) {
    const isExist = await checkFileOrFolderExist(folderPath);
    if (!isExist) {
      createFolderPromises.push(await mkdir(folderPath, { recursive: true }));
    }
  }

  return await Promise.all(createFolderPromises);
};

export const generateMDXComponentFileName = (mdxFileName: string) => {
  const fileNameWithoutExtension = mdxFileName.replace(".mdx", "");
  // Capitalize first character
  return (
    fileNameWithoutExtension.charAt(0).toUpperCase() +
    fileNameWithoutExtension.slice(1)
  );
};

export const generateReleaseMDXFileName = (releaseVersion: string) => {
  return `release_${releaseVersion.replace(/\./g, "_")}.mdx`;
};
