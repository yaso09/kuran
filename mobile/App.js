import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, StatusBar as RNStatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Network from 'expo-network';
import OfflineScreen from './components/OfflineScreen';

export default function App() {
  const [isOffline, setIsOffline] = useState(false);
  const [key, setKey] = useState(0); // Used to force reload WebView
  const webViewRef = useRef(null);
  const url = 'https://kuran.yasireymen.com';

  const checkConnection = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
      return !offline;
    } catch (error) {
      console.error('Error checking network state:', error);
      return true; // Default to online if check fails
    }
  };

  useEffect(() => {
    checkConnection();

    // Polling as a backup for real-time monitoring if needed, 
    // though getNetworkStateAsync is usually enough for manual retry
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" backgroundColor="#0b0c0f" />
        {isOffline && Platform.OS !== 'web' ? (
          <OfflineScreen onRetry={handleRetry} />
        ) : Platform.OS === 'web' ? (
          <iframe
            src={url}
            style={styles.iframe}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <WebView
            key={key}
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            {...(Platform.OS === 'ios' ? { decelerationRate: 'normal' } : {})}
            originWhitelist={['*']}
            allowFileAccess={true}
            onError={() => setIsOffline(true)}
            onHttpError={() => setIsOffline(true)}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c0f',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0b0c0f',
  },
  iframe: {
    flex: 1,
    borderWidth: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#0b0c0f',
  }
});
