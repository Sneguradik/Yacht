package com.skolopendra.lib.graph.items

import com.skolopendra.lib.graph.GraphResultMappingOptions
import com.skolopendra.lib.graph.SelectTreeNode
import com.skolopendra.lib.graph.StoredJoin
import org.jooq.Record
import org.jooq.SelectFieldOrAsterisk

interface IResolvable {
    fun joins(parameters: Map<String, Any?>, node: SelectTreeNode): Collection<StoredJoin> = emptySet()
    fun select(parameters: Map<String, Any?>, node: SelectTreeNode): List<SelectFieldOrAsterisk>
    fun fetch(parameters: Map<String, Any?>, node: SelectTreeNode, record: Record, options: GraphResultMappingOptions = GraphResultMappingOptions.DEFAULT_MAPPING_OPTIONS): Any?
}