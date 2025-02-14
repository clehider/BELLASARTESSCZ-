import React from 'react';
import TextField from '@mui/material/TextField';
import { dateConfig } from '../../config/dateConfig';

const DatePicker = ({ value, onChange, label, error, helperText, ...props }) => {
  const handleChange = (event) => {
    const newValue = event.target.value;
    onChange(newValue);
  };

  return (
    <TextField
      type="date"
      value={value || ''}
      onChange={handleChange}
      label={label}
      error={error}
      helperText={helperText}
      InputLabelProps={{
        shrink: true,
      }}
      {...props}
    />
  );
};

export default DatePicker;
