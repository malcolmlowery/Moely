import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';

const Button = ({ 
  buttonType, 
  buttonStyle,
  children, 
  fontSize = 14,
  fontWeight,
  gradientOff,
  leftButtonText,
  leftButtonStyle,
  leftOnPressButton,
  leftButtonTextColor,
  onPress,
  rightButtonText,
  rightButtonStyle,
  rightOnPressButton,
  rightButtonTextColor,
  style,
  text,
  textColor = '#363636' }: any) => {

  switch(buttonType) {
    case 'button-fill': {
      return(
        <ButtonFill onPress={onPress} style={buttonStyle}>
          <Text style={{ fontSize }}>{children}</Text>
        </ButtonFill>
      )
    }
    case 'text-only': {
      return(
        <TextOnlyButton onPress={onPress} style={style}>
          <Text style={{color: textColor, fontSize, fontWeight }}>{children}</Text>
        </TextOnlyButton>
      )
    }
    case 'split-button': {
      return(
        <SplitButtonContainer>
          <SplitButton onPress={leftOnPressButton} style={[leftButtonStyle, { borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}>
            <Text style={{ fontSize, color: leftButtonTextColor || '#fff' }}>{leftButtonText}</Text>
          </SplitButton>
          <SplitButton onPress={rightOnPressButton} style={[rightButtonStyle, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}>
            <Text style={{ fontSize, color: rightButtonTextColor || '#fff' }}>{rightButtonText}</Text>
          </SplitButton>
        </SplitButtonContainer>
      )
    }
    case 'gradient-button': {
      return(
        <GradientBtn onPress={onPress} style={style}>
            <Text style={{ color: '#fff', fontWeight: '500' }}>{text}</Text>
            {!gradientOff &&
              <LinearGradient 
                colors={['#6938FC', '#6D78F4']} 
                start={{ x: -1, y: 0 }}
                style={{ height: '100%', width: '100%', position: 'absolute', zIndex: -9 }} 
              />
            }
        </GradientBtn>
      )
    }
    default: {
      return(
        <ButtonFill onPress={onPress}>
          <Text>{children}</Text>
        </ButtonFill>
      )
    }
  }
};

export default Button;

const ButtonFill = styled.TouchableOpacity`
  align-items: center;
  align-self: center;
  background-color: #363636;
  border-radius: 20px;
  height: 50px;
  justify-content: center;
  overflow: hidden;
  width: 220px;
`;

const SplitButton = styled.TouchableOpacity`
  align-items: center;
  align-self: center;
  background-color: #363636;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  flex: 1;
  height: 45px;
  justify-content: center;
`;

const SplitButtonContainer = styled.View`
  flex-direction: row;
`;

const TextOnlyButton = styled.TouchableOpacity`
  overflow: hidden;
`;

const Text = styled.Text`
  color: #fff; 
  font-weight: 600; 
  font-size: 16px;
`;

const GradientBtn = styled.TouchableOpacity` 
  align-self: center;
  align-items: center;
  border-radius: 16px;
  height: 42px;
  justify-content: center;
  overflow: hidden;
  width: 220px;
`;