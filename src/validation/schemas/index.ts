export { loginSchema, validateLoginForm, type LoginFormData } from './login.schema';
export { registrationSchema, validateRegistrationForm, type RegistrationFormData } from './registration.schema';
export {
  clientOnboardingSchema,
  driverOnboardingSchema,
  validateClientOnboarding,
  validateDriverOnboarding,
  type ClientOnboardingData,
  type DriverOnboardingData,
  type FieldErrors,
} from './onboarding.schema';