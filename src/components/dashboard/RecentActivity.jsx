import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const RecentActivity = ({ activities }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'materia':
        return <SchoolIcon />;
      case 'tarea':
        return <AssignmentIcon />;
      default:
        return <PersonIcon />;
    }
  };

  return (
    <List sx={{ width: '100%', overflow: 'auto' }}>
      {activities.map((activity, index) => (
        <ListItem key={index}>
          <ListItemIcon>
            {getIcon(activity.type)}
          </ListItemIcon>
          <ListItemText
            primary={activity.description}
            secondary={new Date(activity.timestamp).toLocaleString()}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default RecentActivity;
