import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Linking, Platform, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

import { Error } from '~/components/Error';
import { YgtStatusBar } from '~/components/YgtStatusBar';
import theme from '~/styles/theme';

const uri = 'https://app.ygtang.kr/';

export default function HomeScreen() {
  const [isError, setIsError] = useState(false);
  const webViewRef = useRef<WebView>();
  const fadeAnimationRef = useRef(new Animated.Value(0));

  const animationConfig: Animated.TimingAnimationConfig = useMemo(() => {
    return { useNativeDriver: false, toValue: 1, duration: 1700 };
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnimationRef.current, animationConfig).start();
  }, [animationConfig]);

  const handleExternalLinks = (event: WebViewNavigation) => {
    const isExternalLink = Platform.OS === 'ios' ? event.navigationType === 'click' : true;
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
    <View style={{ flex: 1, backgroundColor: theme.color.background }}>
      <YgtStatusBar />
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          opacity: fadeAnimationRef.current,
          backgroundColor: theme.color.background,
        }}
      >
        <WebView
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
          onNavigationStateChange={handleExternalLinks}
          onShouldStartLoadWithRequest={handleExternalLinks}
          style={{
            backgroundColor: theme.color.background,
          }}
        />
      </Animated.View>
    </View>
  );
}
