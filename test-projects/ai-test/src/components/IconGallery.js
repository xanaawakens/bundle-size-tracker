import { h } from 'preact';
import { styled } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BackupIcon from '@mui/icons-material/Backup';

const IconContainer = styled('div')`
  display: flex;
  gap: 8px;
  padding: 16px;
`;

const IconGallery = () => (
  <IconContainer>
    <AddCircleIcon />
    <AlarmOnIcon />
    <AssessmentIcon />
    <BackupIcon />
  </IconContainer>
);

export default IconGallery;
