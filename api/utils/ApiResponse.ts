export default class ApiResponse {
  statusCode: number
  data: any
  message: string
  success: boolean

  constructor(statusCode: number, data: any, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    }
  }
}
