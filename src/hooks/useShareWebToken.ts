import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

import { APP_GROUP_KEY, SYNC_YGT_RT } from '~/constants/common';

const localStorageUserTokenKeys = {
  accessToken: 'ygtlsat',
  refreshToken: 'ygtrfhtk',
} as const;

export function useShareWebToken() {
  const setRefreshToken = async (value: string) => {
    await SharedGroupPreferences.setItem(SYNC_YGT_RT, value, APP_GROUP_KEY);
  };

  const makeInjectedJavaScript = async () => {
    if (Platform.OS !== 'ios') return `(function() {})();`;
    try {
      const refreshToken = await SharedGroupPreferences.getItem(SYNC_YGT_RT, APP_GROUP_KEY);
      return `(function() {
          window.localStorage.setItem('${
            localStorageUserTokenKeys.refreshToken
          }','${refreshToken}');
          if(${!refreshToken}) {
            window.localStorage.setItem('${
              localStorageUserTokenKeys.accessToken
            }','${refreshToken}');
          }
        })();`;
    } catch (error) {
      if (error === 0) console.error('App Group이 없습니다.');
      return `(function() {})();`;
    }
  };

  return { makeInjectedJavaScript, setRefreshToken };
}
