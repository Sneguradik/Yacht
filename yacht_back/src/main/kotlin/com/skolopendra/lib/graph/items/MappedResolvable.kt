package com.skolopendra.lib.graph.items

import com.skolopendra.lib.graph.GraphResultMappingOptions
import com.skolopendra.lib.graph.SelectTreeNode
import org.jooq.Record

class MappedResolvable<T, U>(
        resolvable: IResolvable,
        val mapper: (value: T) -> U?,
        val nullable: Boolean
) : AbstractProxyResolvable(resolvable) {
    override fun fetch(parameters: Map<String, Any?>, node: SelectTreeNode, record: Record, options: GraphResultMappingOptions): U? {
        val result = super.fetch(parameters, node, record, options)
        if (!nullable && result == null)
            return null
        return mapper(result as T)
    }
}