import Cameraroll from '@react-native-community/cameraroll';
import { PermissionsAndroid, Platform } from 'react-native';
import { WebViewNavigation } from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';

async function hasAndroidPermission() {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === 'granted';
}

/**
 * 이미지 저장을 위한 유틸
 *
 * @param event
 * `WebviewNavigation` 객체
 *
 * @returns `void`
 */
export async function imageDownload(event: WebViewNavigation) {
  if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
    return;
  }

  if (Platform.OS === 'android') {
    RNFetchBlob.config({
      fileCache: true,
      addAndroidDownloads: { useDownloadManager: true, notification: true },
    }).fetch('GET', event.url);
    return;
  }

  Cameraroll.save(event.url);
}
