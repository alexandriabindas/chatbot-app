import React from 'react';
import {SafeAreaView, StyleSheet, useColorScheme} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import ChatScreen from './ChatScreen';
import StyleganScreen from './StylganScreen';
import HomeScreen from './HomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {socket} from './socket';
import ChatGroup from './ChatGroup';
import ChatGroupScreen from './ChatGroupScreen';

const Stack = createStackNavigator();

const apps = [
  {
    appName: 'openchat',
    display: 'Open Chat',
  },
  {
    appName: 'llama2',
    display: 'Llama2',
  },
  {
    appName: 'llama2-uncensored',
    display: 'Llama2 Uncensored',
  },
];

function App(): JSX.Element {
  const [readyApps, setReadyApps] = React.useState<string[]>([]);

  const isDarkMode = useColorScheme() === 'dark';
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    },
    content: {backgroundColor: '#ffffff', flex: 1, paddingTop: 10},
  });

  const onAppIsReady = (appName: string) => {
    setReadyApps([...readyApps, appName]);
  };

  const clearAllReadyApps = () => {
    setReadyApps([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home">
            {props => (
              <HomeScreen
                {...props}
                apps={apps}
                clearAllReadyApps={clearAllReadyApps}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ChatGroup" component={ChatGroupScreen} />
          <Stack.Screen name="ChatBotLlamaUnscensored" component={ChatScreen} />
          {apps.map(app => (
            <Stack.Screen key={app.appName} name={app.appName}>
              {props => (
                <ChatScreen
                  {...props}
                  isAppReady={readyApps.includes(app.appName)}
                  onAppIsReady={onAppIsReady}
                  appName={app.appName}
                  app={app}
                />
              )}
            </Stack.Screen>
          ))}

          <Stack.Screen name="ComputerVision" component={StyleganScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default App;
