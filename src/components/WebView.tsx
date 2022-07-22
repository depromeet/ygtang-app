import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Linking, Platform } from 'react-native';
import { WebView as RnWebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

import { Error } from '~/components/Error';
import { AWS_S3_IMG_BUCKET_URI } from '~/constants/common';
import { useWebViewNavigateWrapping } from '~/hooks/useWebViewNavigateWrapping';
import theme from '~/styles/theme';
import { imageDownload } from '~/utils/imageDownload';

interface WebViewProps {
  uri: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  customRef?: React.MutableRefObject<RnWebView<{}> | undefined>;
  onMessage?: (event: WebViewMessageEvent) => void;
  onNavigate?: (event: WebViewNavigation) => boolean;
  onLoadEnd?: () => void;
}

export default function WebView({
  uri,
  customRef,
  onMessage,
  onNavigate,
  onLoadEnd,
}: WebViewProps) {
  const [isError, setIsError] = useState(false);
  const {
    canGoBack,
    injectCode,
    handleMessage: handleNavigateMessage,
  } = useWebViewNavigateWrapping();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const webViewRef = customRef ?? useRef<RnWebView>();
  const fadeAnimationRef = useRef(new Animated.Value(0));

  const animationConfig: Animated.TimingAnimationConfig = useMemo(() => {
    return { useNativeDriver: false, toValue: 1, duration: 1700 };
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnimationRef.current, animationConfig).start();
  }, [animationConfig]);

  const handleExternalLinks = (event: WebViewNavigation) => {
    if (Platform.OS !== 'ios') {
      return false;
    }

    const isExternalLink = event.navigationType === 'click';
    if (isExternalLink) {
      Linking.canOpenURL(event.url).then(supported => {
        if (supported) {
          Linking.openURL(event.url);
        }
      });
      return false;
    }
    return true;
  };

  const handleNavigate = (event: WebViewNavigation) => {
    // NOTE: 이미지 저장 클릭 시
    if (event.url.startsWith(AWS_S3_IMG_BUCKET_URI)) {
      imageDownload(event);
      return false;
    }

    if (onNavigate && onNavigate(event)) {
      return true;
    }

    return handleExternalLinks(event);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    if (onMessage) {
      onMessage(event);
    }
    handleNavigateMessage(event);
  };

  const handleBackButtonPress = useCallback(() => {
    try {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      return false;
    } catch (err) {
      console.log('[handleBackButtonPress] Error : ', err);
    }
  }, [canGoBack, webViewRef]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonPress);
      };
    }
  }, [handleBackButtonPress]);

  if (isError) {
    return (
      <Error
        reload={() => {
          setIsError(false);
          webViewRef.current?.reload();
        }}
      />
    );
  }

  return (
    <Animated.View
      style={{
        width: '100%',
        height: '100%',
        opacity: fadeAnimationRef.current,
        backgroundColor: theme.color.background,
      }}
    >
      <RnWebView
        ref={ref => {
          if (!ref) return;
          webViewRef.current = ref;
        }}
        source={{ uri }}
        bounces={false}
        applicationNameForUserAgent={'YgtangApp/1.0'}
        allowsBackForwardNavigationGestures
        domStorageEnabled
        onError={() => {
          setIsError(true);
        }}
        onLoadStart={() => webViewRef.current?.injectJavaScript(injectCode)}
        onLoadEnd={onLoadEnd}
        onNavigationStateChange={handleNavigate}
        onShouldStartLoadWithRequest={handleNavigate}
        style={{
          backgroundColor: theme.color.background,
        }}
        onMessage={handleMessage}
        onFileDownload={e => {
          console.log('file download');
          console.log(e);
        }}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
      />
    </Animated.View>
  );
}
