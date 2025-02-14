import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { People as PeopleIcon, Grade as GradeIcon } from '@mui/icons-material';

const TeacherCoursesList = ({ courses, onViewStudents, onManageGrades }) => {
  return (
    <Grid container spacing={3}>
      {courses.map((course) => (
        <Grid item xs={12} sm={6} md={4} key={course.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {course.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`${course.studentCount} estudiantes`}
                  icon={<PeopleIcon />}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={course.status}
                  color={course.status === 'activo' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<PeopleIcon />}
                onClick={() => onViewStudents(course.id)}
              >
                Ver Estudiantes
              </Button>
              <Button 
                size="small" 
                startIcon={<GradeIcon />}
                onClick={() => onManageGrades(course.id)}
              >
                Gestionar Notas
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TeacherCoursesList;
