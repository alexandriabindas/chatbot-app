import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import HeaderBar from './HeaderBar';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {socket} from './socket';
import Chat from './Chat';
import {defaultUser} from './types';
import ChatGroup from './ChatGroup';

// const defaultActiveBots = ['llama2', 'openchat', 'llama2-uncensored'];
// const defaultActiveBots = ['llama2-uncensored'];

const ChatGroupScreen = ({app}: any) => {
  const [document, setDocument] = useState<DocumentPickerResponse>();
  const [data, setData] = useState<any>();
  const [isReady, onAppIsReady] = useState(false);

  React.useEffect(() => {
    if (!isReady) {
      socket.emit('join_group', {
        active_bots: ['llama2', 'llama2-uncensored'],
        user: defaultUser,
      });
      onAppIsReady(true);
    }

    fetch('http://localhost:8080/api/v1/config')
      .then(response => response.json())
      .then(res => {
        console.log(res);
        setData(res);
      });
  }, [document]);

  const onSetDocument = (doc: DocumentPickerResponse | undefined): void => {
    socket.emit('document-group', {
      document: doc,
      user: defaultUser,
    });
    setDocument(doc);
  };

  const onSetData = (data: any | undefined): void => {
    console.log('Setting data', data);
    setData(data);
  };

  return (
    <View style={styles.content}>
      <HeaderBar data={data} document={document} />
      <ChatGroup
        onSetData={onSetData}
        onSetDocument={onSetDocument}
        document={document}
        activeBots={['llama2', 'llama2-uncensored']}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  content: {backgroundColor: '#ffffff', flex: 1, paddingTop: 10},
});

export default ChatGroupScreen;
