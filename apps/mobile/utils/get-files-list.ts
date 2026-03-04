import * as FileSystem from 'expo-file-system/legacy';

export const getFilesList = async (path: string): Promise<string[]> => {
  try {
    const dir = `${FileSystem.documentDirectory}${path}`;
    const directoryInfo = await FileSystem.getInfoAsync(dir);

    if (!directoryInfo.exists || !directoryInfo.isDirectory) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(dir);
    return files.map((file) => `${dir}/${file}`);
  } catch (error) {
    console.error(`Error reading directory at path ${path}:`, error);
    return [];
  }
};
