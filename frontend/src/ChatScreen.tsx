import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import HeaderBar from './HeaderBar';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {socket} from './socket';
import Chat from './Chat';
import {defaultUser} from './types';

// const defaultActiveBots = ['llama2', 'openchat', 'llama2-uncensored'];
// const defaultActiveBots = ['llama2-uncensored'];

const ChatScreen = ({app, onAppIsReady, isAppReady}: any) => {
  const [document, setDocument] = useState<DocumentPickerResponse>();
  const [data, setData] = useState<any>();

  React.useEffect(() => {
    if (!isAppReady) {
      socket.emit('join_chat', {
        active_bots: [app.appName],
        user: defaultUser,
      });
      onAppIsReady(app.appName);
    }

    fetch('http://localhost:8080/api/v1/config')
      .then(response => response.json())
      .then(res => {
        console.log(res);
        setData(res);
      });
  }, []);

  const onSetDocument = (doc: DocumentPickerResponse | undefined): void => {
    socket.emit('document', {
      document: doc,
      user: defaultUser,
    });
  };

  const onSetData = (data: any | undefined): void => {
    setData(data);
  };

  return (
    <View style={styles.content}>
      <HeaderBar data={data} document={document} />
      <Chat
        onSetData={onSetData}
        onSetDocument={onSetDocument}
        document={document}
        activeBots={[app.appName]}
        app={app}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  content: {backgroundColor: '#ffffff', flex: 1, paddingTop: 10},
});

export default ChatScreen;
