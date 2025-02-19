package com.skolopendra.lib.graph.items

import com.skolopendra.lib.graph.GraphResultMappingOptions
import com.skolopendra.lib.graph.SelectTreeNode
import org.jooq.Field
import org.jooq.Record
import org.jooq.SelectFieldOrAsterisk

class JooqResolvable<T>(
        val field: Field<T>
) : IResolvable {
    override fun select(parameters: Map<String, Any?>, node: SelectTreeNode): List<SelectFieldOrAsterisk> =
            listOf(field)

    override fun fetch(parameters: Map<String, Any?>, node: SelectTreeNode, record: Record, options: GraphResultMappingOptions): Any? =
            record.get(field)
}