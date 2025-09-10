import * as FileSystem from "expo-file-system";

export const copyFile = async (sourcePath: string, destinationPath: string) => {
  try {
    return FileSystem.copyAsync({
      from: sourcePath,
      to: destinationPath,
    });
  } catch (error) {
    console.error("Error copying file:", error);
    throw error;
  }
};
