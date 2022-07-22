import React, { useCallback, useEffect, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { StyleSheet, View } from 'react-native';
import ShareMenu from 'react-native-share-menu';

import { ShareHandler } from '~/components/ShareHandler';
import { YgtStatusBar } from '~/components/YgtStatusBar';
import MainNavigator from '~/navigation/MainNavigator';
import theme from '~/styles/theme';

import 'react-native-gesture-handler';

export default function App() {
  const [shareMenu, setShareMenu] = useState(false);
  const [shareData, setShareData] = useState<string | null>(null);
  const [shareMimeType, setShareMimeType] = useState<string | null>(null);

  const getString = async () => {
    const text = await Clipboard.getString();
    console.log('getString>>>>>', text);
  };

  useEffect(() => {
    getString();
  }, []);

  const handleShare = useCallback(item => {
    if (!item) {
      return;
    }
    const { mimeType, data } = item;
    setShareMenu(true);
    setShareData(data);
    setShareMimeType(mimeType);
  }, []);

  const closeShareView = () => {
    setShareMenu(false);
    setShareData(null);
    setShareMimeType(null);
  };

  useEffect(() => {
    ShareMenu.getInitialShare(handleShare);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const listener = ShareMenu.addNewShareListener(handleShare);

    return () => {
      listener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shareMenu && shareData && shareMimeType) {
    return <ShareHandler data={shareData} mimeType={shareMimeType} handleClose={closeShareView} />;
  }

  return (
    <>
      <YgtStatusBar />
      <View style={styles.root}>
        <MainNavigator />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.color.background,
  },
});
