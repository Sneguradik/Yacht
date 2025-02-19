package com.skolopendra.lib.error

/**
 * Custom error classes to throw from services/controllers
 */

class AlreadyExistsException(override val message: String? = null) : RuntimeException(message)

class RateLimitException : RuntimeException()