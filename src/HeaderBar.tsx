import React, {useState} from 'react';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {StyleSheet, Text, View} from 'react-native';
import CheckboxBar from './CheckBoxBar';

const HeaderBar = ({document}: {document: DocumentPickerResponse}) => {
//   const pickDocument = () => {
//     DocumentPicker.pickSingle().then((document: DocumentPickerResponse) => {
//       setDocument(document);
//     });
//   };

  return (
    <View style={styles.container}>
      {/* <CheckboxBar /> */}
      <Text>{document?.name}</Text>
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
