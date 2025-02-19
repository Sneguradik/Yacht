package com.skolopendra.lib.graph.items

import com.skolopendra.lib.graph.GraphResultMappingOptions
import com.skolopendra.lib.graph.SelectTreeNode
import com.skolopendra.lib.graph.StoredJoin
import org.jooq.Record
import org.jooq.SelectFieldOrAsterisk

abstract class AbstractProxyResolvable(
        protected val resolvable: IResolvable
) : IResolvable {
    override fun joins(parameters: Map<String, Any?>, node: SelectTreeNode): Collection<StoredJoin> =
            resolvable.joins(parameters, node)

    override fun select(parameters: Map<String, Any?>, node: SelectTreeNode): List<SelectFieldOrAsterisk> =
            resolvable.select(parameters, node)

    override fun fetch(parameters: Map<String, Any?>, node: SelectTreeNode, record: Record, options: GraphResultMappingOptions): Any? =
            resolvable.fetch(parameters, node, record, options)
}