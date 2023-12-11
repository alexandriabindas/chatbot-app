import React, {useState, useEffect, useCallback} from 'react';
import {GiftedChat, IMessage, Reply} from 'react-native-gifted-chat';
import {socket} from './socket';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import uuid from 'react-native-uuid';

interface IProps {
  activeBots: string[];
  onSetDocument: (doc: DocumentPickerResponse | undefined) => void;
  onSetData: (data: any) => void;
  document?: DocumentPickerResponse;
}

const defaultUser = {
  _id: 'alex',
  name: 'Alex',
};

interface IMessageOverride extends IMessage {
  data?: any;
  configId?: string;
}
const ChatGroup = ({onSetData, activeBots, onSetDocument}: IProps) => {
  const [messages, setMessages] = useState<IMessageOverride[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    function onTyping(typing: boolean) {
      setIsTyping(typing);
    }
    function onMessage(message: IMessageOverride) {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, {
          ...message,
          // @ts-ignore
          createdAt: new Date(),
        }),
      );
    }
    function onConfigUpdateSuccess(message: IMessageOverride) {
      console.log('onConfigUpdateSuccess', onConfigUpdateSuccess);
      message._id = uuid.v4().toString();
      message?.data && onSetData(message?.data);
      onMessage(message);
    }
    socket.on('config_update', onConfigUpdateSuccess);
    socket.on('message', onMessage);
    socket.on('typing', onTyping);
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
    } else if (messageText.includes('/config')) {
      const loader = messageText.split('/config ')[1];
      socket.emit('/config', loader);
    } else {
      const message = {
        // prompt: 'What do you know about the document in 2 sentences?',
        prompt: messageText,
        active_bots: ['llama2', 'llama2-uncensored'],
        user: defaultUser,
      };
      socket.emit('send_message', message);
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

export default ChatGroup;
