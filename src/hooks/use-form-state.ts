import { useState, useCallback, useMemo } from 'react';

/**
 * Hook para gestionar el estado completo de un formulario.
 * Maneja valores, errores, touched, validación y envío.
 */
type FormValidationSchema<FormData> = {
  [FieldName in keyof FormData]?: (value: FormData[FieldName]) => string | undefined;
};

interface FormStateOptions<FormData> {
  initialValues: Partial<FormData>;
  validationSchema?: FormValidationSchema<FormData>;
  onSubmit?: (formData: FormData) => Promise<void> | void;
}

interface FormStateReturn<FormData> {
  values: Partial<FormData>;
  errors: Partial<Record<keyof FormData, string>>;
  touched: Partial<Record<keyof FormData, boolean>>;
  isSubmitting: boolean;
  hasErrors: boolean;
  handleChange: <FieldName extends keyof FormData>(field: FieldName, value: FormData[FieldName]) => void;
  handleBlur: <FieldName extends keyof FormData>(field: FieldName) => void;
  setFieldError: <FieldName extends keyof FormData>(field: FieldName, errorMessage: string | undefined) => void;
  setFieldValue: <FieldName extends keyof FormData>(field: FieldName, value: FormData[FieldName]) => void;
  validateAllFields: () => boolean;
  submitForm: () => Promise<void>;
  resetForm: (newValues?: Partial<FormData>) => void;
}

// Hook para gestionar estado completo de formulario (valores, errores, validación)
export function useFormState<FormData extends Record<string, unknown>>({
  initialValues,
  validationSchema,
  onSubmit,
}: FormStateOptions<FormData>): FormStateReturn<FormData> {
  const [values, setValues] = useState<Partial<FormData>>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFormErrors = useMemo(() => {
    return Object.values(errors).some((errorMessage) => errorMessage !== undefined);
  }, [errors]);

  // Función para manejar cambios de valor de un campo
  // Utiliza la API para actualizar el valor del campo
  const handleFieldChange = useCallback(
    <FieldName extends keyof FormData>(field: FieldName, value: FormData[FieldName]) => {
      setValues((previousValues) => ({ ...previousValues, [field]: value }));

      if (validationSchema?.[field]) {
        const fieldValidationFn = validationSchema[field];
        const fieldError = fieldValidationFn(value as FormData[FieldName]);
        setErrors((previousErrors) => ({ ...previousErrors, [field]: fieldError }));
      }
    },
    [validationSchema],
  );

  // Función para manejar el evento de blur de un campo
  // Utiliza la API para actualizar el estado de touched
  const handleFieldBlur = useCallback(
    <FieldName extends keyof FormData>(field: FieldName) => {
      setTouched((previousTouched) => ({ ...previousTouched, [field]: true }));

      if (validationSchema?.[field]) {
        const fieldValue = values[field];
        if (fieldValue !== undefined) {
          const fieldValidationFn = validationSchema[field];
          const fieldError = fieldValidationFn(fieldValue as FormData[FieldName]);
          setErrors((previousErrors) => ({ ...previousErrors, [field]: fieldError }));
        }
      }
    },
    [validationSchema, values],
  );

  // Función para establecer manualmente el mensaje de error de un campo
  // Utiliza la API para actualizar el mensaje de error del campo
  const setFieldErrorMessage = useCallback(
    <FieldName extends keyof FormData>(field: FieldName, errorMessage: string | undefined) => {
      setErrors((previousErrors) => ({ ...previousErrors, [field]: errorMessage }));
    },
    [],
  );

  // Función para establecer manualmente el valor de un campo
  // Utiliza la API para actualizar el valor del campo
  const setFieldValueDirectly = useCallback(
    <FieldName extends keyof FormData>(field: FieldName, value: FormData[FieldName]) => {
      setValues((previousValues) => ({ ...previousValues, [field]: value }));
    },
    [],
  );

  // Función para validar todos los campos del formulario
  // Utiliza la API para actualizar los errores de validación
  const validateAllFields = useCallback(() => {
    if (!validationSchema) return true;

    const newValidationErrors: Partial<Record<keyof FormData, string>> = {};
    let isFormValid = true;

    Object.keys(validationSchema).forEach((fieldName) => {
      const fieldKey = fieldName as keyof FormData;
      const fieldValue = values[fieldKey];
      const fieldValidationFn = validationSchema[fieldKey];

      if (fieldValidationFn && fieldValue !== undefined) {
        const errorMessage = fieldValidationFn(fieldValue as FormData[keyof FormData]);
        if (errorMessage) {
          newValidationErrors[fieldKey] = errorMessage;
          isFormValid = false;
        }
      }
    });

    setErrors(newValidationErrors);
    return isFormValid;
  }, [validationSchema, values]);

  const submitForm = useCallback(async () => {
    setTouched(
      Object.keys(values).reduce(
        (accumulator, fieldKey) => ({ ...accumulator, [fieldKey]: true }),
        {} as Partial<Record<keyof FormData, boolean>>,
      ),
    );

    const isFormValid = validateAllFields();
    if (!isFormValid || !onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values as FormData);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAllFields, onSubmit]);

  const resetForm = useCallback(
    (newValues?: Partial<FormData>) => {
      setValues(newValues ?? initialValues);
      setErrors({});
      setTouched({});
    },
    [initialValues],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    hasErrors: hasFormErrors,
    handleChange: handleFieldChange,
    handleBlur: handleFieldBlur,
    setFieldError: setFieldErrorMessage,
    setFieldValue: setFieldValueDirectly,
    validateAllFields: validateAllFields,
    submitForm: submitForm,
    resetForm: resetForm,
  };
}

export type { FormStateOptions, FormStateReturn };