package com.skolopendra.lib.access

import org.springframework.security.core.Authentication

interface ITargetAccessChecker<T : Any> : IPermissionChecks<T> {
    fun hasPermission(authentication: Authentication, target: T, permission: String): Boolean
}