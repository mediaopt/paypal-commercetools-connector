export type ValidationHandlers = {
  isValid: () => Promise<boolean>;
  showValidation: () => Promise<void>;
};

export type GenericError = {
  code: string;
  message: string;
};

export type RequestHeader = { [key: string]: string };

export type BuilderType = "dropin" | "express" | undefined;
