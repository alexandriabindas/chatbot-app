import React, {useState, useEffect, useCallback} from 'react';
import {GiftedChat, IMessage, Reply} from 'react-native-gifted-chat';
import {socket} from './socket';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import uuid from 'react-native-uuid';
import {App, SocketReceiveEvent, SocketSendEvents, defaultUser} from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {storeNewMessage} from './helper';

interface IProps {
  activeBots: string[];
  onSetDocument: (doc: DocumentPickerResponse | undefined) => void;
  onSetData: (data: any) => void;
  document?: DocumentPickerResponse;
  app: App;
}

export interface IMessageOverride extends IMessage {
  data?: any;
  configId?: string;
}
const Chat = ({onSetData, app, activeBots, onSetDocument}: IProps) => {
  const [messages, setMessages] = useState<IMessageOverride[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Load chat messages when the screen is focused
    const loadChatMessages = async () => {
      const storedMessages = await AsyncStorage.getItem(app.appName);
      const systemMessages = await AsyncStorage.getItem('system');
      if (storedMessages && systemMessages) {
        setMessages([
          ...JSON.parse(storedMessages),
          ...JSON.parse(systemMessages),
        ]);
      } else if (storedMessages) {
        setMessages([...JSON.parse(storedMessages)]);
      } else if (systemMessages) {
        setMessages([...JSON.parse(systemMessages)]);
      }
    };

    loadChatMessages();
  }, []);

  useEffect(() => {
    // Save chat messages when they change
    const saveChatMessages = async () => {
      await AsyncStorage.setItem(app.appName, JSON.stringify(messages));
    };
    saveChatMessages();
  }, [messages]);

  useEffect(() => {
    function onTyping(typing: boolean) {
      setIsTyping(typing);
    }
    function onMessage(message: IMessageOverride) {
      if (app.appName === message.user._id) {
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, {
            ...message,
            // @ts-ignore
            createdAt: new Date(),
          }),
        );
      } else {
        storeNewMessage(message);
      }
    }
    function onConfigUpdateSuccess(message: IMessageOverride) {
      message._id = uuid.v4().toString();
      message?.data && onSetData(message?.data);
      onMessage(message);
    }
    socket.on(SocketReceiveEvent.ConfigUpdate, onConfigUpdateSuccess);
    socket.on('message', onMessage);
    socket.on(SocketReceiveEvent.Typing, onTyping);
    return () => {
      socket.off('message');
      socket.off('typing');
    };
  }, []);

  const pickDocument = () => {
    DocumentPicker.pickSingle()
      .then((doc: DocumentPickerResponse) => {
        onSetDocument(doc);
      })
      .catch(() => {
        onSetDocument(undefined);
      });
  };

  const onQuickReply = useCallback((replies: Reply[]) => {
    const reply = replies[0];
    socket.emit('update_config', reply);
  }, []);

  const onSend = useCallback((newMessages: IMessageOverride[]) => {
    const newMessage = newMessages[0];
    const messageText = newMessage.text;
    if (messageText === '/pdf') {
      pickDocument();
    } else if (messageText.includes(SocketSendEvents.Config)) {
      const loader = messageText.split(SocketSendEvents.Config)[1];
      socket.emit(SocketSendEvents.Config, loader);
    } else {
      const message = {
        // prompt: 'What do you know about the document in 2 sentences?',
        prompt: messageText,
        active_bots: activeBots,
        user: defaultUser,
      };
      socket.emit(SocketSendEvents.SendMessage, message);
    }
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, {
        ...newMessage,
        _id: uuid.v4().toString(),
      }),
    );
  }, []);

  return (
    <GiftedChat
      isTyping={isTyping}
      messages={messages}
      onSend={onSend}
      onQuickReply={onQuickReply}
      user={defaultUser}
    />
  );
};

export default Chat;
