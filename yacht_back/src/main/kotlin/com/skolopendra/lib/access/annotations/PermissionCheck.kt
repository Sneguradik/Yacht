package com.skolopendra.lib.access.annotations

@Target(AnnotationTarget.FUNCTION)
annotation class PermissionCheck(
        vararg val value: String
)