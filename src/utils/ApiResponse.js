class ApiResponse{
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 //google status codes (it has different values which signify different things) for error responses
        
    }
}