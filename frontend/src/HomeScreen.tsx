import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button, StyleSheet, View} from 'react-native';
import {App, defaultUser} from './types';
import {storeNewMessage} from './helper';
import {socket} from './socket';
import {IMessageOverride} from './Chat';

const HomeScreen = ({
  apps,
  clearAllReadyApps,
  navigation,
}: {
  clearAllReadyApps: any;
  apps: App[];
  navigation: any;
}) => {
  React.useEffect(() => {
    function onMessage(message: IMessageOverride) {
      if (
        message &&
        !message._id.toString().includes('loader') &&
        !message._id.toString().includes('embedding')
      ) {
        storeNewMessage(message);
      }
    }
    socket.on('message', onMessage);
    return () => {
      socket.off('message');
    };
  }, []);
  const clearChats = () => {
    const clearAllChats = async () => {
      apps.forEach(async (app: App) => {
        const storedMessages = await AsyncStorage.setItem(
          app.appName,
          JSON.stringify([]),
        );
        console.log(storedMessages);
      });
      await AsyncStorage.setItem('system', JSON.stringify([]));
    };

    clearAllChats();
    clearAllReadyApps();
  };

  const clearPDF = () => {
    socket.emit('document', {
      document: undefined,
      user: defaultUser,
    });
  };
  return (
    <View style={styles.content}>
      {apps.map((app: any) => (
        <Button
          key={app.appName}
          title={app.display}
          onPress={() => navigation.navigate(app.appName)}
        />
      ))}
      <Button
        title={'Llama2 and Llama2 Uncensored'}
        onPress={() => navigation.navigate('ChatGroup')}
      />
      <Button
        color="red"
        title="Clear all chats"
        onPress={() => clearChats()}
      />
      <Button color="red" title="Clear PDF" onPress={() => clearPDF()} />
    </View>
  );
};
const styles = StyleSheet.create({
  content: {backgroundColor: '#ffffff', flex: 1, paddingTop: 10},
});

export default HomeScreen;
