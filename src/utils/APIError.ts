class APIError<T = any> {
    statusCode: number;
    message: string;
    data: T;
    success: boolean;

    constructor(statusCode: number, message: string, data: T = [] as unknown as T) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}

export default APIError;