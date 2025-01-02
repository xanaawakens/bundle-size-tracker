import { h } from 'preact';
import { useState } from 'preact/hooks';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import DateRangeIcon from '@mui/icons-material/DateRange';
import throttle from 'lodash-es/throttle';
import dayjs from 'dayjs';

// Import locale
import 'dayjs/locale/vi';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(LocalizedFormat);
dayjs.locale('vi');

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`;

const DateText = styled('p')`
  margin: 8px 0;
  font-size: 1rem;
`;

const DatePicker = () => {
  const [date, setDate] = useState(dayjs());

  const handleClick = throttle(() => {
    setDate(dayjs());
  }, 1000);

  return (
    <Container>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleClick}
        startIcon={<DateRangeIcon />}
      >
        Update Date
      </Button>
      <DateText>Current date: {date.format('LLLL')}</DateText>
    </Container>
  );
};

export default DatePicker;
