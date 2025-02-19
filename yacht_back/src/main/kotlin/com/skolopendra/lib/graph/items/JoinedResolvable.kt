package com.skolopendra.lib.graph.items

import com.skolopendra.lib.graph.SelectTreeNode
import com.skolopendra.lib.graph.StoredJoin

class JoinedResolvable(
        resolvable: IResolvable,
        private val join: StoredJoin
) : AbstractProxyResolvable(resolvable) {
    override fun joins(parameters: Map<String, Any?>, node: SelectTreeNode): Collection<StoredJoin> =
            setOf(join) + super.joins(parameters, node)
}