import { useState, useCallback } from 'react';

/**
 * Hook para manejar el envío de formularios con estados de carga y error.
 */
interface FormSubmitOptions<FormData> {
  onSubmit: (formData: FormData) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

interface FormSubmitReturn<FormData> {
  isSubmitting: boolean;
  error: string | null;
  submitForm: (formData: FormData) => Promise<void>;
  clearError: () => void;
}

// Hook para manejar envío de formularios con estados de carga y error
export function useFormSubmit<FormData>({
  onSubmit,
  onSuccess,
  onError,
}: FormSubmitOptions<FormData>): FormSubmitReturn<FormData> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitForm = useCallback(
    async (formData: FormData) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setError(null);

      try {
        await onSubmit(formData);
        onSuccess?.();
      } catch (errorObject) {
        const errorMessage = errorObject instanceof Error ? errorObject.message : 'Error desconocido';
        setError(errorMessage);
        onError?.(errorObject);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onSubmit, onSuccess, onError],
  );

  const clearErrorMessage = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSubmitting,
    error,
    submitForm,
    clearError: clearErrorMessage,
  };
}

export type { FormSubmitOptions, FormSubmitReturn };