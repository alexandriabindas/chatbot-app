/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {GiftedChat, SendButton} from 'react-native-gifted-chat';
import initialMessages from './messages';
import {
  renderInputToolbar,
  renderActions,
  renderComposer,
  renderSend,
} from './InputToolbar';
import {
  renderAvatar,
  renderBubble,
  renderSystemMessage,
  renderMessage,
  renderMessageText,
  renderCustomView,
} from './MessageContainer';
import {StyleSheet, Text, View} from 'react-native';
import {Button} from 'react-native-elements';

const Chats = () => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages(initialMessages.reverse());
  }, []);

  const onSend = (newMessages = []) => {
    setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));
  };

  const myAttachmentFunction = () => {
    console.log('REACHED');
  };

  return (
    <GiftedChat
      messages={messages}
      text={text}
      onInputTextChanged={setText}
      onSend={onSend}
      textInputStyle={{color: "white"}}
      user={{
        _id: 1,
        name: 'Alex',
        // avatar: 'https://placeimg.com/150/150/any',
      }}
      alignTop
      alwaysShowSend
      scrollToBottom
      // showUserAvatar
      //   renderAvatarOnTop
      //   renderUsernameOnMessage
      //   bottomOffset={26}
      //   onPressAvatar={console.log}
      renderInputToolbar={renderInputToolbar}
      //   renderActions={renderActions}
      //   renderSend={renderSend}
      renderActions={() => (
        <View style={styles.container}>
          <Button
            onPress={() => myAttachmentFunction()}
            title={<Text style={styles.buttonText}>+</Text>}
          />
        </View>
      )}
      //   renderAvatar={renderAvatar}
      //   renderBubble={renderBubble}
      //   renderSystemMessage={renderSystemMessage}
      //   renderMessage={renderMessage}
      //   renderMessageText={renderMessageText}
      // renderMessageImage
      //   renderCustomView={renderCustomView}
      //   isCustomViewBottom
      messagesContainerStyle={{paddingVertical: 10}}
      //   parsePatterns={linkStyle => [
      //     {
      //       pattern: /#(\w+)/,
      //       style: linkStyle,
      //       onPress: tag => console.log(`Pressed on hashtag: ${tag}`),
      //     },
      //   ]}
    />
  );
};

export default Chats;
const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Define additional styles if needed
});
