package com.skolopendra.lib.access

import org.springframework.security.core.Authentication

interface IStaticAccessChecker<T : Any> : IPermissionChecks<T> {
    fun hasPermission(authentication: Authentication, permission: String): Boolean
}