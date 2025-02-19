package com.skolopendra.lib.graph

import org.jooq.Condition
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.SelectQuery
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable

class GraphQuery(
        val dsl: DSLContext,
        val graph: Graph,
        val parameters: Map<String, Any?>,
        val query: SelectQuery<Record>
) {
    var select: SelectTreeNode? = null

    private fun select(tree: SelectTreeNode): GraphQuery {
        if (this.select != null)
            throw IllegalStateException("Select already applied to graph")
        this.select = tree
        for (f in tree.children) {
            if (!graph.fields.containsKey(f.name))
                throw IllegalStateException("unknown key ${f.name}")
            query.addSelect(graph.fields[f.name]!!.select(parameters, f))
        }
        graph.joins(parameters, tree).forEach { query.addJoin(it.table, it.type, *it.conditions) }
        return this
    }

    fun fetchSingle(tree: SelectTreeNode, options: GraphResultMappingOptions = GraphResultMappingOptions.DEFAULT_MAPPING_OPTIONS): GraphResult {
        select(tree)
        return graph.fetch(parameters, select!!, query.fetchSingle(), options)
    }

    fun fetch(tree: SelectTreeNode, options: GraphResultMappingOptions = GraphResultMappingOptions.DEFAULT_MAPPING_OPTIONS): List<GraphResult> {
        select(tree)
        return query.fetch { graph.fetch(parameters, select!!, it, options) }
    }

    fun fetchCount(): Long {
        return dsl.fetchCount(query).toLong()
    }

    fun fetchPage(tree: SelectTreeNode, pageable: Pageable, options: GraphResultMappingOptions = GraphResultMappingOptions.DEFAULT_MAPPING_OPTIONS): Page<GraphResult> {
        select(tree)
        val count = fetchCount()
        query.addOffset(pageable.offset)
        query.addLimit(pageable.pageSize)
        return PageImpl(query.fetch { graph.fetch(parameters, tree, it, options) }, pageable, count)
    }

    fun where(vararg conditions: Condition) {
        query.addConditions(*conditions)
    }
}

