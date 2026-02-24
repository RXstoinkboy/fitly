import * as FileSystem from 'expo-file-system';

export const saveToFileSystem = async (path: string, imageData: string, name?: string) => {
  try {
    const dir = `${FileSystem.documentDirectory}${path}/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    const fileName = name ?? `${Date.now()}.png`;
    const fileUri = dir + fileName;

    await FileSystem.writeAsStringAsync(fileUri, imageData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  } catch (error) {
    console.error('Error saving to file system:', error);
  }
};
