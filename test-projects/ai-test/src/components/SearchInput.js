import { h } from 'preact';
import { useState } from 'preact/hooks';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import debounce from 'lodash-es/debounce';

const StyledTextField = styled(TextField)`
  width: 300px;
  margin: 16px;
`;

const SearchInput = () => {
  const [value, setValue] = useState('');

  const handleChange = debounce((e) => {
    setValue(e.target.value);
  }, 300);

  return (
    <StyledTextField 
      label="Enter text" 
      onChange={handleChange} 
      InputProps={{
        startAdornment: <AccountCircleIcon />
      }}
    />
  );
};

export default SearchInput;
