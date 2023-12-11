import React, {useState} from 'react';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {StyleSheet, Text, View} from 'react-native';
import CheckboxBar from './CheckBoxBar';

interface IData {
  embedding?: string;
  loader?: string;
  document?: DocumentPickerResponse;
}

interface IProps {
  document?: DocumentPickerResponse;
  data?: IData;
}
const HeaderBar = ({data}: IProps) => {
  return (
    <View style={styles.container}>
      {/* <CheckboxBar /> */}
      <Text style={{fontStyle: 'italic'}}>
        {data?.document?.name || 'No file selected'}
      </Text>
      <>
        {data &&
          Object.keys(data).map((key: string) => {
            if (key !== 'document') {
              return (
                <Text key={key}>
                  {key}: {data[key]}
                </Text>
              );
            } else {
              return null;
            }
          })}
      </>
    </View>
  );
};

export default HeaderBar;
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    fontSize: 8,
    // Additional styling
  },
  // Other styles like individual checkbox style
});
