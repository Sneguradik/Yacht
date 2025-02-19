package com.skolopendra.lib.access.annotations

import kotlin.reflect.KClass

@Target(AnnotationTarget.FUNCTION)
annotation class StaticAccess(
        val resourceClass: KClass<*>,
        val permission: String
)