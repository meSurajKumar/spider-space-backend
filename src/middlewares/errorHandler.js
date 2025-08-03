import AppError from "./AppError.js";
import {errorMessages} from '../common/apiResponse.js'

const errorHandler = async (err , req  , res , next) => {
    const {SOMETHING_WENT_WRONG} = errorMessages;
    const statusCode = err instanceof AppError ? err.statusCode : SOMETHING_WENT_WRONG.statusCode;
    const apiCode = err instanceof AppError ? err.apiCode : SOMETHING_WENT_WRONG.apiCode;
    const errorMessage = err instanceof AppError ? err.errorMessage : SOMETHING_WENT_WRONG.message;
    return res.status(statusCode).json({apiCode : apiCode , message : errorMessage});
};

export default errorHandler;