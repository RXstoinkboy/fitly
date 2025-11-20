import * as FileSystem from 'expo-file-system';

export const copyFile = async (
  sourcePath: string,
  destinationPath: string,
  destinationFileName: string,
) => {
  try {
    const docDir = FileSystem.documentDirectory ?? '';

    // Normalize destination directory:
    // - If caller passed a path that already includes the document directory or a file:// URI,
    //   use it as-is.
    // - Otherwise, treat the destinationPath as relative to documentDirectory and prepend it.
    let destDir = destinationPath;
    const looksAbsolute =
      destDir.startsWith(docDir) || destDir.startsWith('file://') || destDir.startsWith('/');
    if (!looksAbsolute) {
      destDir = `${docDir}${destDir}`;
    }

    // Ensure trailing slash
    if (!destDir.endsWith('/')) destDir = `${destDir}/`;

    const dirInfo = await FileSystem.getInfoAsync(destDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
    }

    const to = destDir + destinationFileName;

    return FileSystem.copyAsync({
      from: sourcePath,
      to,
    });
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
};
