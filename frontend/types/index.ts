export * from './user';
export * from './batch';

export type ApiSuccessResponse<T> = {
  statusCode: 200;
  data: T;
  message: string;
  success: true;
};

export type ApiErrorResponse = {
  error: true;
  statusCode: number;
  success: false;
  message: string;
};