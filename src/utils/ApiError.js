//this file displays errors on api calls and is used in the error handling middleware
//it also logs any errors to a log file.
class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        errorStack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null // what is this? check documentation on nodejs.org
        this.message = message
        this.success = false
        this.errors = errors

        if(errorStack){
            this.errorStack = errorStack
        } else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}

export {ApiError}