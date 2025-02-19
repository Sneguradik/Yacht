package com.skolopendra.lib.graph.items

import com.skolopendra.lib.graph.GraphResultMappingOptions
import com.skolopendra.lib.graph.SelectTreeNode
import org.jooq.Record
import org.jooq.SelectFieldOrAsterisk

class ConstResolvable<T>(val value: T) : IResolvable {
    override fun select(parameters: Map<String, Any?>, node: SelectTreeNode): List<SelectFieldOrAsterisk> = emptyList()

    override fun fetch(parameters: Map<String, Any?>, node: SelectTreeNode, record: Record, options: GraphResultMappingOptions): T = value
}