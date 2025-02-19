package com.skolopendra.lib.graph

interface IResultTransformer {
    fun accepts(input: Any?): Boolean
    fun transform(input: Any?): Any?
}