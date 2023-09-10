import styled from 'styled-components/native';
import { useWindowDimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const TextInput = ({ 
  autoCompleteType,
  icon, 
  keyboardType,
  onChangeText, 
  placeholder,
  returnKeyType,
  secureTextEntry,
  spellCheck,
  textContentType,
  value }: any) => {
  const { width: screenWidth } = useWindowDimensions();
  
  return(
    <InputItem style={{ marginBottom: 16, width: screenWidth > 900 ? 310 : 280 }}>
      <InputItemIcon>
        <FontAwesome5 color='#363636' name={icon} size={24} />
      </InputItemIcon>
      <InputItemText 
        autoCompleteType={autoCompleteType}
        keyboardType={keyboardType}
        onChangeText={onChangeText} 
        placeholder={placeholder} 
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        spellCheck={spellCheck}
        textContentType={textContentType}
        value={value} />
    </InputItem>
  )
};

export default TextInput;

const InputItem = styled.View`
  align-items: center;
  background-color: #F8F8F8;
  border-radius: 30px;
  display: flex;
  flex-direction: row;
  height: 55px;
  position: relative;
  width: 310px;
`;

const InputItemIcon = styled.View`
  align-items: center;
  justify-content: center;
  margin-left: 16px;
`;

const InputItemText = styled.TextInput`
  color: #363636;
  font-weight: 500;
  font-size: 15px;
  padding: 18px 10px;
  width: 236px;
`;