import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CreatePostButton = ({ onPress }) => {
    return(
        <Pressable onPress={() => onPress()}>
            <Ionicons name='pencil' color='#fff' size={30} />
        </Pressable>
    );
};

export default CreatePostButton;

const Pressable = styled.Pressable`
    align-items: center;
    background-color: #1f1f1f;
    border-radius: 50px;
    bottom: 32px;
    justify-content: center;
    position: absolute;
    right: 16px;
    height: 80px;
    width: 80px;
`;