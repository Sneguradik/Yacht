package com.skolopendra.lib

@Target(AnnotationTarget.PROPERTY, AnnotationTarget.CLASS)
@MustBeDocumented
annotation class Patchable(
        val value: Boolean = true
)