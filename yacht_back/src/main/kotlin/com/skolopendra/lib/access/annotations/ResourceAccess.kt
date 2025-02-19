package com.skolopendra.lib.access.annotations

import kotlin.reflect.KClass

@Target(AnnotationTarget.FUNCTION)
annotation class ResourceAccess(
        val resourceType: KClass<*>,
        val permission: String
)