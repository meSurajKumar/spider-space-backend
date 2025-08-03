export default class AppError extends Error{
    constructor(message , apiCode , statusCode){
        super(message);
        this.apiCode = apiCode;
        this.statusCode = statusCode;
        this.errorMessage = message;
        Error.captureStackTrace(this, this.constructor)        
    }
}