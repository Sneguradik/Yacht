package com.skolopendra.lib.error

class FullErrorResponse(
        message: String,
        val exceptionMessage: String?
) : ErrorResponse(message)