import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import HeaderBar from './HeaderBar';
import ChatScreen from './Chat';
import {DocumentPickerResponse} from 'react-native-document-picker';

const defaultActiveBots = ['llama2', 'openchat', 'llama2-uncensored'];
// const defaultActiveBots = ['llama2'];

function App(): JSX.Element {
  const [document, setDocument] = useState<DocumentPickerResponse>();

  const isDarkMode = useColorScheme() === 'dark';
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    },
    content: {backgroundColor: '#ffffff', flex: 1, paddingTop: 10},
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HeaderBar document={document}/>
        <ChatScreen setDocument={setDocument} document={document} activeBots={defaultActiveBots} />
      </View>
    </SafeAreaView>
  );
}

export default App;
