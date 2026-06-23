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
    error.data
  ) {
    const errorData = error.data as ApiErrorData;
    if (typeof errorData.message === "string" && typeof errorData.error === "string") {
      return `${errorData.message}: ${errorData.error}`;
    }
    if (typeof errorData.message === "string") {
      return errorData.message;
    }
    if (typeof errorData.error === "string") {
      return errorData.error;
    }
  }

  if (typeof error?.data === "string") {
    return error.data;
  }

  if (error?.message) {
    return error.message;
  }

  return defaultMessage;
};
