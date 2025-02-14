import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Typography,
  Chip,
} from '@mui/material';

const SubjectsList = ({ subjects }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Materias Inscritas
      </Typography>
      <List>
        {subjects.map((subject) => (
          <ListItem key={subject.id}>
            <ListItemText
              primary={subject.name}
              secondary={`Profesor: ${subject.teacherName}`}
            />
            <ListItemSecondaryAction>
              <Chip
                label={subject.status}
                color={subject.status === 'En curso' ? 'primary' : 'success'}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default SubjectsList;
