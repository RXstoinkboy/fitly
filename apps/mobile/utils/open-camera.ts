import * as ImagePicker from 'expo-image-picker';

export const openCamera = async () => {
  // No permissions request is necessary for launching the image library
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    allowsMultipleSelection: false,
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
};
