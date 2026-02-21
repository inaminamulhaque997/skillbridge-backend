export class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data: T;
  public statusCode: number;

  constructor(statusCode: number, data: T, message: string = 'Success') {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message: string = 'Success', statusCode: number = 200) {
    return new ApiResponse(statusCode, data, message);
  }

  static created<T>(data: T, message: string = 'Created successfully') {
    return new ApiResponse(201, data, message);
  }
}
