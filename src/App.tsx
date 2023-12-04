import React from 'react';
import {SafeAreaView, StyleSheet, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import ChatScreen from './Chat';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    },
    content: {backgroundColor: '#ffffff', flex: 1},
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ChatScreen />
      </View>
    </SafeAreaView>
  );
}

export default App;
