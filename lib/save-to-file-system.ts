import * as FileSystem from "expo-file-system";

export const saveToFileSystem = async (
  path: string,
  imageData: string,
  name?: string,
) => {
  const fileName = name ?? `${Date.now()}.png`;

  const fileUri = `${FileSystem.documentDirectory}${path}/` + fileName;

  await FileSystem.writeAsStringAsync(fileUri, imageData, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};
