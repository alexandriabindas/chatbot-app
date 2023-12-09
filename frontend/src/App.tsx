import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {socket} from './socket';

import HeaderBar from './HeaderBar';
import ChatScreen from './Chat';
import {DocumentPickerResponse} from 'react-native-document-picker';

const defaultActiveBots = ['llama2', 'openchat', 'llama2-uncensored'];
// const defaultActiveBots = ['llama2', 'llama2-uncensored'];
const defaultUser = {
  _id: 1,
  name: 'Alex',
};
function App(): JSX.Element {
  const [document, setDocument] = useState<DocumentPickerResponse>();
  const [data, setData] = useState<any>();
  const [isAppReady, setAppReady] = useState(false);

  React.useEffect(() => {
    socket.emit('join_chat', {
      active_bots: defaultActiveBots,
      user: defaultUser,
    });

    fetch('http://localhost:8080/api/v1/config')
      .then(response => response.json())
      .then(res => {
        setData(res);
      });
    setAppReady(true);
  }, []);

  const isDarkMode = useColorScheme() === 'dark';
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    },
    content: {backgroundColor: '#ffffff', flex: 1, paddingTop: 10},
  });

  React.useEffect(() => {
    if (isAppReady) {
      socket.emit('document', {
        document: document,
        user: {
          _id: 1,
          name: 'Alex',
        },
      });
    }
  }, [document]);

  const onSetDocument = (doc: DocumentPickerResponse | undefined): void => {
    setDocument(doc);
  };

  const onSetData = (data: any | undefined): void => {
    setData(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HeaderBar data={data} document={document} />
        <ChatScreen
          onSetData={onSetData}
          onSetDocument={onSetDocument}
          document={document}
          activeBots={defaultActiveBots}
        />
      </View>
    </SafeAreaView>
  );
}

export default App;
