import { useState, useCallback } from 'react';

/**
 * Hook para gestionar el estado de un campo individual de formulario.
 * Proporciona manejo de valor, errores, validación y reset del campo.
 */
interface FormFieldOptions<FieldValue> {
  initialValue?: FieldValue;
  validate?: (value: FieldValue) => string | undefined;
  transform?: (value: FieldValue) => FieldValue;
}

interface FormFieldReturn<FieldValue> {
  value: FieldValue;
  error: string | undefined;
  touched: boolean;
  onChange: (newValue: FieldValue) => void;
  onBlur: () => void;
  reset: (newValue?: FieldValue) => void;
  setError: (errorMessage: string | undefined) => void;
  setValue: (newValue: FieldValue) => void;
}

// Hook para gestionar estado de un campo individual de formulario
export function useFormField<FieldValue = string>({
  initialValue,
  validate,
  transform,
}: FormFieldOptions<FieldValue> = {}): FormFieldReturn<FieldValue> {
  const [value, setValueState] = useState<FieldValue | undefined>(initialValue);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  // Función para manejar cambios de valor del campo
  // Utiliza la API para actualizar el valor del campo
  const handleChange = useCallback(
    (newValue: FieldValue) => {
      const transformedValue = transform ? transform(newValue) : newValue;
      setValueState(transformedValue);

      if (validate && touched) {
        const validationError = validate(transformedValue);
        setError(validationError);
      }
    },
    [validate, touched, transform],
  );

  // Función para manejar el evento de blur del campo
  // Utiliza la API para actualizar el estado de touched
  const handleBlur = useCallback(() => {
    setTouched(true);
    if (validate && value !== undefined) {
      const validationError = validate(value);
      setError(validationError);
    }
  }, [validate, value]);

  const resetField = useCallback((newValue?: FieldValue) => {
    setValueState(newValue ?? initialValue);
    setError(undefined);
    setTouched(false);
  }, [initialValue]);

  const setFieldErrorMessage = useCallback((errorMessage: string | undefined) => {
    setError(errorMessage);
  }, []);

  const setFieldValueDirectly = useCallback((newValue: FieldValue) => {
    setValueState(newValue);
  }, []);

  return {
    value: value as FieldValue,
    error,
    touched,
    onChange: handleChange,
    onBlur: handleBlur,
    reset: resetField,
    setError: setFieldErrorMessage,
    setValue: setFieldValueDirectly,
  };
}

export type { FormFieldOptions, FormFieldReturn };