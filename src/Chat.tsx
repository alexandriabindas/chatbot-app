import React, {useState, useEffect, useCallback} from 'react';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import {socket} from './socket';

const ChatScreen = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    socket.on('message', (message: IMessage) => {
      setIsTyping(false);
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, {
          ...message,
          // @ts-ignore
          createdAt: new Date(),
        }),
      );
    });
    return () => {
      socket.off('send_message');
    };
  }, []);
  const onSend = useCallback((newMessages: IMessage[]) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages[0]),
    );
    setIsTyping(true);
    socket.emit('send_message', newMessages[0].text);
  }, []);
  return (
    <GiftedChat
      isTyping={isTyping}
      messages={messages}
      onSend={onSend}
      user={{_id: 1, name: 'Alex'}}
    />
  );
};

export default ChatScreen;
