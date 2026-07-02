import * as ImagePicker from 'expo-image-picker';

export const openImageLibrary = async () => {
  // No permissions request is necessary for launching the image library
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    allowsMultipleSelection: false,
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
};
