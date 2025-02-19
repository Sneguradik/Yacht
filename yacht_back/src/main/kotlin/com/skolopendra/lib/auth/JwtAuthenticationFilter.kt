package com.skolopendra.lib.auth

import org.springframework.security.authentication.AuthenticationServiceException
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.RequestMatcher
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class JwtAuthenticationFilter(
        requestMatcher: RequestMatcher
) : AbstractAuthenticationProcessingFilter(requestMatcher) {
    private val requestHeaderName = "Authorization"
    private val tokenPrefix = "Bearer "

    override fun attemptAuthentication(request: HttpServletRequest, response: HttpServletResponse): Authentication? {
        val authorizationHeader = request.getHeader(requestHeaderName)
        if (authorizationHeader == null || authorizationHeader.length < tokenPrefix.length) {
            throw AuthenticationServiceException("Missing header")
        }
        val token = authorizationHeader.substring(tokenPrefix.length)
        return authenticationManager.authenticate(RawJwtAuthentication(token))
    }

    override fun requiresAuthentication(request: HttpServletRequest, response: HttpServletResponse): Boolean {
        val authorizationHeader = request.getHeader(requestHeaderName)
        return !(authorizationHeader == null || authorizationHeader.length < tokenPrefix.length)
    }

    override fun successfulAuthentication(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain, authResult: Authentication?) {
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authResult
        SecurityContextHolder.setContext(context)
        chain.doFilter(request, response)
    }

    override fun unsuccessfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, failed: AuthenticationException?) {
        SecurityContextHolder.clearContext()
        failureHandler.onAuthenticationFailure(request, response, failed)
    }
}