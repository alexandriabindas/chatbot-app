import React from 'react';
import {useState} from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const CheckboxBar = () => {
  const [isSelected, setSelection] = useState([false, false, false]); // Assuming 3 checkboxes

  const toggleCheckbox = (index: number) => {
    const updatedSelection = [...isSelected];
    updatedSelection[index] = !updatedSelection[index];
    setSelection(updatedSelection);
  };

  return (
    <View style={styles.container}>
      {isSelected.map((item, index) => (
        <CheckBox
          key={index}
          value={item}
          onValueChange={() => toggleCheckbox(index)}
        />
      ))}
    </View>
  );
};

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

export default CheckboxBar;
