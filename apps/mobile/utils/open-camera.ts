import * as ImagePicker from 'expo-image-picker';

export const openCamera = async () => {
  // Camera permission must be requested before launch on both iOS and Android.
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    console.warn('Camera permission denied');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
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
