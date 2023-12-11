export const SocketSendEvents = {
  Config: '/config',
  SendMessage: 'send_message',
};

export const SocketReceiveEvent = {
  ConfigUpdate: 'config_update',
  Typing: 'typing',
};

export interface App {
  appName: string;
  display: string;
}

export const defaultUser = {
  _id: 'alex',
  name: 'Alex',
};
