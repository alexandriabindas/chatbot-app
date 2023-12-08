import React, {useState, useEffect, useCallback} from 'react';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import {socket} from './socket';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';

interface IProps {
  activeBots: string[];
  setDocument: any;
  document: DocumentPickerResponse;
}
const ChatScreen = ({document, activeBots, setDocument}: IProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.emit('join_chat', {
      active_bots: activeBots,
      user: {
        _id: 1,
        name: 'Alex',
      },
    });
  }, [activeBots]);

  useEffect(() => {
    function onTyping(typing: boolean) {
      setIsTyping(typing);
    }
    function onMessage(message: IMessage) {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, {
          ...message,
          // @ts-ignore
          createdAt: new Date(),
        }),
      );
    }
    socket.on('message', onMessage);
    socket.on('typing', onTyping);
    return () => {
      socket.off('message');
      socket.off('typing');
    };
  }, []);

  const pickDocument = () => {
    DocumentPicker.pickSingle().then((document: DocumentPickerResponse) => {
      setDocument(document);
    });
  };

  const onSend = useCallback((newMessages: IMessage[]) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages[0]),
    );
    const messageText = newMessages[0].text;
    if (messageText === '/pdf') {
      pickDocument();
    } else {
      const message = {
        prompt: messageText,
        pdf_context: document,
        active_bots: activeBots,
      };
      socket.emit('send_message', message);
    }
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
