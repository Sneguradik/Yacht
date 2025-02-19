package com.skolopendra.lib.graph

import org.jooq.JSON
import org.jooq.types.YearToSecond
import java.sql.Timestamp

class GraphResultMappingOptions(
        val skipNulls: Boolean = false
) {
    private val transformers = mutableListOf<IResultTransformer>()

    fun transform(input: Any?): Any? {
        var current = input
        for (t in transformers) {
            if (t.accepts(current))
                current = t.transform(current)
        }
        return current
    }

    fun addTransformer(transformer: IResultTransformer) {
        transformers.add(transformer)
    }

    companion object {
        val DEFAULT_MAPPING_OPTIONS = GraphResultMappingOptions(skipNulls = false).apply {
            addTransformer(object : IResultTransformer {
                override fun accepts(input: Any?): Boolean {
                    return input != null && input is Timestamp
                }

                override fun transform(input: Any?): Any? {
                    return (input as Timestamp).time
                }
            })
            addTransformer(object : IResultTransformer {
                override fun accepts(input: Any?): Boolean {
                    return input != null && input is JSON
                }

                override fun transform(input: Any?): Any? {
                    return (input as JSON).data()
                }
            })
            addTransformer(object : IResultTransformer {
                override fun accepts(input: Any?): Boolean {
                    return input != null && input is YearToSecond
                }

                override fun transform(input: Any?): Any? {
                    return (input as YearToSecond).toDuration().toMillis()
                }
            })
        }
    }
}