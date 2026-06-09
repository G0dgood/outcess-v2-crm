export type ApiErrorData = {
  message?: string;
  error?: string;
};

export type ApiError = {
  status?: number;
  data?: ApiErrorData | string;
  message?: string;
};

export const extractErrorMessage = (
  error: ApiError,
  defaultMessage: string,
): string => {
  if (
    typeof error?.data === "object" &&
    error.data &&
    "message" in error.data &&
    typeof (error.data as ApiErrorData).message === "string"
  ) {
    return (error.data as ApiErrorData).message as string;
  }

  if (
    typeof error?.data === "object" &&
    error.data &&
    "error" in error.data &&
    typeof (error.data as ApiErrorData).error === "string"
  ) {
    return (error.data as ApiErrorData).error as string;
  }

  if (typeof error?.data === "string") {
    return error.data;
  }

  if (error?.message) {
    return error.message;
  }

  return defaultMessage;
};
