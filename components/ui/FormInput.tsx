import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  required = false, 
  error, 
  style, 
  ...props 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && '*'}
      </Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={Colors.app.textSecondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    color: Colors.app.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.app.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.app.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.app.border,
  },
  inputError: {
    borderColor: Colors.app.error,
  },
  errorText: {
    color: Colors.app.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FormInput; 