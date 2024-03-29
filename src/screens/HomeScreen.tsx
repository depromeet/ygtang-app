import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView as RnWebView, WebViewMessageEvent } from 'react-native-webview';

import { ClipboardMessenger } from '~/components/ClipboardMessenger';
import WebView from '~/components/WebView';
import { BASE_URI, SYNC_YGT_RT } from '~/constants/common';
import { useShareWebToken } from '~/hooks/useShareWebToken';
import theme from '~/styles/theme';

export default function HomeScreen() {
  const webViewRef = useRef<RnWebView>();
  const { makeInjectedJavaScript, setRefreshToken } = useShareWebToken();

  const handleLoadEnd = async () => {
    const injectedRefreshJavaScript = await makeInjectedJavaScript();
    webViewRef?.current?.injectJavaScript(injectedRefreshJavaScript || '');
  };

  const onReceiveMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === SYNC_YGT_RT) {
        await setRefreshToken(data.data);
      }
    } catch (error) {
      console.warn('[onReceiveMessage] received not json type');
    }
  };

  return (
    <SafeAreaView
      edges={['right', 'top', 'left']}
      style={{ flex: 1, backgroundColor: theme.color.background }}
    >
      <ClipboardMessenger webViewRef={webViewRef}>
        <WebView
          customRef={webViewRef}
          uri={BASE_URI}
          onLoadEnd={handleLoadEnd}
          onMessage={onReceiveMessage}
        />
      </ClipboardMessenger>
    </SafeAreaView>
  );
}
