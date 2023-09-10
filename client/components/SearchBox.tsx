import styled from 'styled-components/native';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSearchBox } from 'react-instantsearch-hooks';

const SearchBox = (props) => {
	const { query, refine } = useSearchBox(props);
	const [inputValue, setInputValue] = useState(query);
	const inputRef = useRef(null);

	const setQuery = (newQuery) => {
		setInputValue(newQuery)
		refine(newQuery)
	};

	if(query !== inputValue && !inputRef.current?.isFocused()) {
		setInputValue(query)
	};

	return(
			<Container style={{
				shadowOffset: { width: 1, height: 20 },
				shadowOpacity: .075,
				shadowRadius: 50 }}>
				<SearchBoxContainer>
					<TextInput
						ref={inputRef}
						value={inputValue}
						onChangeText={setQuery}
						clearButtonMode="while-editing"
						autoCorrect={false}
						spellCheck={false}
						placeholder='Find a user...'
					/>
					<Ionicons color='#595959' name='ios-search' size={24} />
				</SearchBoxContainer>
			</Container>
	);
};

export default SearchBox;

const Container = styled.View`
	align-self: center;
    background-color: #fff;
	padding: 10px 0;
	width: 100%;
	z-index: 1000;
`;

const SearchBoxContainer = styled.View`
	align-items: center;
	background-color: #fff;
	border-radius: 120px;
	flex-direction: row;
	margin: 0 3px;
	padding: 2px 8px;
	padding-right: 14px;
`;

const TextInput = styled.TextInput`
	flex: 1;
	font-weight: 500;
	font-size: 15px;
	letter-spacing: 0.1px;
	margin: 0 8px;
	padding: 8px 0;
`;