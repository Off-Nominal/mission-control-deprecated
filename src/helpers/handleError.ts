export const handleError = (err: unknown): [string, number | null] => {
  // if (axios.isAxiosError(err)) {
  //   if (!err.response || !err.response.data) {
  //     return [t("error.no_response"), null, null];
  //   }

  //   const httpError = err.response.status;
  //   const axiosResponseData = err.response.data;

  //   if (isApplicationErrorResponse(axiosResponseData)) {
  //     const appErrorCode = axiosResponseData.error_code;
  //     const translationKey = getAppErrorTranslationKey(appErrorCode);

  //     if (typeof translationKey === "string") {
  //       return [t(translationKey), httpError, appErrorCode];
  //     }
  //   }

  //   // Fallback to HTTP status
  //   const error: string | undefined = t(`error.http.${httpError.toString()}`);

  //   if (error) {
  //     return [error, httpError, null];
  //   }
  // }

  if (err instanceof TypeError) {
    return [err.message, null];
  }

  if (err instanceof RangeError) {
    return [err.message, null];
  }

  if (err instanceof EvalError) {
    return [err.message, null];
  }

  if (err instanceof ReferenceError) {
    return [err.message, null];
  }

  if (err instanceof SyntaxError) {
    return [err.message, null];
  }

  if (err instanceof URIError) {
    return [err.message, null];
  }

  if (err instanceof Error) {
    return [err.message, null];
  }

  // Error passthrough for strings
  if (typeof err === "string") {
    return [err, null];
  }

  // Last fallback
  return ["Unknown error.", null];
};
