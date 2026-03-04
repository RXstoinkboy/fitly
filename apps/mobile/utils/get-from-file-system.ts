import * as FileSystem from 'expo-file-system/legacy';

export const getFromFileSystem = async (path: string): Promise<string | null> => {
  try {
    const file = await FileSystem.readAsStringAsync(path);
    return file;
  } catch (error) {
    console.error(`Error reading file at path ${path}:`, error);
    return null;
  }
};
