import Constants from 'expo-constants';
import { Platform } from 'react-native';

function devHost() {
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

const extra =
  Constants.expoConfig?.extra ||
  Constants.manifest2?.extra ||
  Constants.manifest?.extra ||
  {};

export const API_BASE_URL =
  extra.apiBaseUrl || `http://${devHost()}:4000/api`;
