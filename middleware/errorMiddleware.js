export const errorHandler = (err, req, res, next) => {
  let resStatusCode = res.statusCode === 200 ? 500 : res.statusCode;

  let message = err.message;
  if (err.name === "ValidationError") {
    // err.errors its object and object.values convert object to array
    message = Object.values(err.errors)
      // using map for get each message error from object err.errors
      .map((item) => item.message)
      .join(",");
    resStatusCode = 442;
  }
  res.status(resStatusCode).json({
    message,
    stack: err.stack,
  });
};

export const notFoundPath = (req, res, next) => {
  const error = new Error(`url not found -${req.originalUrl}`);
  res.status(404);
  next(error);
};
