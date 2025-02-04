// Error handler
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    err = new ErrorHandler(
      `Duplicate ${Object.keys(err.keyValue)} Entered`,
      400
    );
  }

  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Json Web Token Is Invalid. Try again!", 400);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Token Expired. Try to Login again.", 400);
  }

  if (err.name === "CastError") {
    err = new ErrorHandler(`Invalid ${err.path}`, 400);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

// export default errorMiddleware;
export default ErrorHandler;
