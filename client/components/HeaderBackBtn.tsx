import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderBackButtonI {
    navigateBack: () => void,
    title: string,
};

const HeaderBackButton = ({ navigateBack, title }: HeaderBackButtonI) => {
    return(
        <HeaderBackBtn onPress={() => navigateBack()}>
            <Ionicons name='arrow-back-circle' color='#1f1f1f' size={24} />
            <HeaderText>{title}</HeaderText>
        </HeaderBackBtn> 
    );
};

export default HeaderBackButton;

const HeaderText = styled.Text`
    color: #1f1f1f;
    font-size: 28px;
    font-weight: 600;
    margin-left: 6px;
`;

const HeaderBackBtn = styled.TouchableOpacity`
    align-items: center;
    flex-direction: row;
`;