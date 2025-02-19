package com.skolopendra.lib.error

import com.fasterxml.jackson.databind.JsonMappingException
import io.jsonwebtoken.JwtException
import org.jooq.exception.NoDataFoundException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.expression.ExpressionInvocationTargetException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.web.firewall.RequestRejectedException
import org.springframework.web.HttpMediaTypeNotSupportedException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.multipart.MultipartException
import org.springframework.web.multipart.support.MissingServletRequestPartException
import org.springframework.web.servlet.NoHandlerFoundException
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.UndeclaredThrowableException
import javax.persistence.EntityNotFoundException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import javax.validation.ConstraintViolationException

@RestControllerAdvice
class ErrorHandler(
        val config: ErrorHandlerConfig
) {
    val logger: Logger = LoggerFactory.getLogger(ErrorHandler::class.java)

    fun <T : Exception> shouldLog(ex: T): Boolean {
        if (config.log.any) return !config.log.exclude.contains(ex.javaClass.name)
        return config.log.include.contains(ex.javaClass.name)
    }

    fun <T : Exception> error(ex: T, message: String): ErrorResponse {
        if (shouldLog(ex)) logger.error("Request error", ex)
        if (config.sendFullMessage) return FullErrorResponse(message, ex.message)
        return ErrorResponse(message)
    }

    @ExceptionHandler(RateLimitException::class)
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    fun handle(ex: RateLimitException) =
            error(ex, "Too many requests")

    @ExceptionHandler(EntityNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handle(ex: EntityNotFoundException) =
            error(ex, "Not found")

    @ExceptionHandler(DataIntegrityViolationException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handle(ex: DataIntegrityViolationException) =
            error(ex, "Data integrity violation")

    @ExceptionHandler(JsonMappingException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handle(ex: JsonMappingException) =
            error(ex, "JSON mapping error")

    @ExceptionHandler(NoSuchElementException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handle(ex: NoSuchElementException) =
            error(ex, "Not found")

    @ExceptionHandler(JwtException::class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun handle(ex: JwtException) =
            error(ex, "JWT exception")

    @ExceptionHandler(HttpMessageNotReadableException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handle(ex: HttpMessageNotReadableException) =
            error(ex, "Malformed HTTP")

    @ExceptionHandler(AlreadyExistsException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handle(ex: AlreadyExistsException) =
            error(ex, ex.message ?: "Already exists")

    @ExceptionHandler(AccessDeniedException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handle(ex: AccessDeniedException) =
            error(ex, "Access is denied")

    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handle(ex: MethodArgumentTypeMismatchException) =
            error(ex, "Invalid argument: '${ex.parameter.parameterName}'")

    @ExceptionHandler(IllegalArgumentException::class)
    fun handle(ex: IllegalArgumentException, request: HttpServletRequest, response: HttpServletResponse): ResponseEntity<Any> {
        val causeRoot = ex.cause
        if (causeRoot is ExpressionInvocationTargetException) {
            val causeIte = causeRoot.cause
            if (causeIte is InvocationTargetException) {
                val source = causeIte.targetException
                val handler = ErrorHandler::class.java.methods.find { it.isAnnotationPresent(ExceptionHandler::class.java) && it.getAnnotation(ExceptionHandler::class.java).value.contains(source::class) }
                if (handler != null) {
                    val retval = handler.invoke(this, source, request, response)
                    val status = if (handler.isAnnotationPresent(ResponseStatus::class.java)) {
                        handler.getAnnotation(ResponseStatus::class.java).value.value()
                    } else {
                        500
                    }
                    return if (Any::class.java.isAssignableFrom(retval.javaClass)) {
                        ResponseEntity.status(status).body(retval)
                    } else {
                        ResponseEntity.status(status).build()
                    }
                }
            }
        }
        return ResponseEntity.badRequest().body(error(ex, "Illegal argument"))
    }

    @ExceptionHandler(BadCredentialsException::class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun handle(ex: BadCredentialsException) =
            error(ex, "Bad credentials")

    @ExceptionHandler(IllegalStateException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handle(ex: IllegalStateException) =
            error(ex, "Illegal state")

    @ExceptionHandler(MissingServletRequestPartException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handle(ex: MissingServletRequestPartException) =
            error(ex, "Missing request part")

    @ExceptionHandler(MultipartException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handle(ex: MultipartException) =
            error(ex, "Malformed multipart")

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handle(ex: MethodArgumentNotValidException): Iterable<Map<String, String?>> {
        if (shouldLog(ex)) logger.error("Request error", ex)
        return ex.bindingResult.fieldErrors.map {
            mapOf(
                    "field" to it.field,
                    "message" to it.defaultMessage
            )
        }
    }

    @ExceptionHandler(UndeclaredThrowableException::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handle(ex: UndeclaredThrowableException) =
            error(ex, "Internal server error")

    @ExceptionHandler(Exception::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handle(ex: Exception) =
            error(ex, "Internal server error")

    @ExceptionHandler(NoHandlerFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handle(ex: NoHandlerFoundException) =
            error(ex, "Not found")

    @ExceptionHandler(HttpRequestMethodNotSupportedException::class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    fun handle(ex: HttpRequestMethodNotSupportedException) =
            error(ex, "Method not supported")

    @ExceptionHandler(ConstraintViolationException::class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    fun handle(ex: ConstraintViolationException) =
            error(ex, "Invalid argument: " + ex.constraintViolations.joinToString(", ") { "${it.propertyPath}: ${it.message}" })

    @ExceptionHandler(MissingServletRequestParameterException::class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    fun handle(ex: MissingServletRequestParameterException) =
            error(ex, "Missing request parameter")

    @ExceptionHandler(NoDataFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handle(ex: NoDataFoundException) =
            error(ex, "Not found")

    @ExceptionHandler(HttpMediaTypeNotSupportedException::class)
    @ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    fun handle(ex: HttpMediaTypeNotSupportedException) =
            error(ex, "Media type not supported: ${ex.contentType?.type}")

    @ExceptionHandler(RequestRejectedException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handle(ex: RequestRejectedException) =
            error(ex, "unsafe URL rejected")
}