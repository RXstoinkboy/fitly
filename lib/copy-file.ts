import * as FileSystem from "expo-file-system";

export const copyFile = async (
  sourcePath: string,
  destinationPath: string,
  destinationFileName: string,
) => {
  try {
    const dir = `${FileSystem.documentDirectory}${destinationPath}/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    return FileSystem.copyAsync({
      from: sourcePath,
      to: destinationPath + destinationFileName,
    });
  } catch (error) {
    console.error("Error copying file:", error);
    throw error;
  }
};
