// Turns anything the API layer rejects with into a user-facing string.
export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim()) return data.message;
    if (typeof data.error === "string" && data.error.trim()) return data.error;
  }

  if (typeof err?.message === "string" && err.message.trim()) return err.message;

  return fallback;
};