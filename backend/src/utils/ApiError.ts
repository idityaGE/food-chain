class ApiError extends Error {
  public statusCode: number;
  public override message: string;
  public errors: any[];
  public override stack = "";

  constructor(
    statusCode: number,
    message: string | any = "Something went wrong!",
    errors: any[] = [],
    stack: string = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.stack = stack;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };