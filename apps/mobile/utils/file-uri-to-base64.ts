import * as FileSystem from 'expo-file-system/legacy';

/**
 * Converts a file URI (e.g., 'file:///path/to/image.jpg') to a base64 string.
 *
 * @param fileUri The URI of the file to convert.
 * @returns A Promise that resolves with the base64 string of the file, or an empty string if the URI is null/undefined.
 * @throws An error if the file cannot be read or converted.
 */
export const fileUriToBase64 = async (fileUri: string | null | undefined): Promise<string> => {
  if (!fileUri) {
    return '';
  }

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
};
