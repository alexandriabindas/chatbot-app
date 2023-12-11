import AsyncStorage from '@react-native-async-storage/async-storage';
import {IMessageOverride} from './Chat';

export const storeNewMessage = async (message: IMessageOverride) => {
  console.log('storeNewMessage', message);
  const userId = `${message.user._id}`;
  console.log('Storing message for', userId);
  const storedMessages = await AsyncStorage.getItem(userId);
  if (storedMessages) {
    await AsyncStorage.setItem(
      userId,
      JSON.stringify([message, ...JSON.parse(storedMessages)]),
    );
  } else {
    await AsyncStorage.setItem(userId, JSON.stringify([message]));
  }
};
