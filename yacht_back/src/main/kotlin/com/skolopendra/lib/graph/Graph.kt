package com.skolopendra.lib.graph

import com.skolopendra.lib.graph.items.*
import org.jooq.*
import org.jooq.impl.DSL

typealias GraphResult = Map<String, Any?>

class StoredJoin(
        val table: TableLike<*>,
        val type: JoinType,
        vararg val conditions: Condition
)

fun selectTree(block: SelectTreeNode.() -> Unit): SelectTreeNode {
    return SelectTreeNode("root").apply(block)
}

class Graph(
        var from: TableLike<*>? = null
) : IResolvable {

    companion object {
        infix fun on(table: Table<*>): Graph =
                Graph(table)
    }

    val fields: MutableMap<String, IResolvable> = mutableMapOf()

    operator fun invoke(block: Graph.() -> Unit): Graph = this.apply(block)

    fun subgraph(block: Graph.() -> Unit): IResolvable {
        return Graph(from).apply(block)
    }

    infix fun String.embed(block: Graph.() -> Unit) {
        fields[this] = Graph(from).apply(block)
    }

    infix fun String.counts(table: TableLike<*>) {
        fields[this] = JooqResolvable(DSL.selectCount().from(DSL.selectOne().from(table)).asField<Long>())
    }

    override fun select(parameters: Map<String, Any?>, node: SelectTreeNode): List<SelectFieldOrAsterisk> =
            node.children.flatMap { fields[it.name]!!.select(parameters, it) }

    override fun joins(parameters: Map<String, Any?>, node: SelectTreeNode): Collection<StoredJoin> =
            node.children.flatMap { fields[it.name]!!.joins(parameters, it) }.distinct()

    override fun fetch(parameters: Map<String, Any?>, node: SelectTreeNode, record: Record, options: GraphResultMappingOptions): GraphResult {
        val map = mutableMapOf<String, Any?>()
        for (f in node.children) {
            val value = fields[f.name]!!.fetch(parameters, f, record)
            if (options.skipNulls && value == null)
                continue
            map[f.name] = options.transform(value)
        }
        return map
    }

    fun jooq(f: Field<*>): IResolvable {
        return JooqResolvable(f)
    }

    infix fun String.by(fn: Function<IResolvable>?) {
        fields[this] = ParameterizedSelect(fn!!)
    }

    infix fun <T> String.from(field: Field<T>) {
        val result = JooqResolvable(field)
        fields[this] = result
    }

    infix fun String.from(resolvable: IResolvable) {
        fields[this] = resolvable
    }

    fun <T> const(value: T): IResolvable =
            ConstResolvable(value)

    infix fun <T> String.const(value: T) {
        fields[this] = ConstResolvable(value)
    }

    fun nil() =
            ConstResolvable(null)

    infix fun <T, U> IResolvable.mapNull(fn: (value: T) -> U) =
            MappedResolvable(this, fn, true)

    infix fun <T, U> IResolvable.map(fn: (value: T) -> U) =
            MappedResolvable(this, fn, false)

    infix fun <T, U> Field<T>.map(fn: (value: T) -> U) =
            MappedResolvable(JooqResolvable(this), fn, false)

    infix fun <E> Field<Int>.enum(values: Array<E>) =
            MappedResolvable<Int, E>(JooqResolvable(this), { values[it] }, false)

    infix fun IResolvable.using(join: StoredJoin) =
            JoinedResolvable(this, join)

    infix fun <T> Field<T>.using(join: StoredJoin) =
            JoinedResolvable(JooqResolvable(this), join)

    fun join(table: TableLike<*>, type: JoinType, vararg conditions: Condition): StoredJoin =
            StoredJoin(table, type, *conditions)

    fun create(dsl: DSLContext, parameters: Map<String, Any?>): GraphQuery {
        val result = GraphQuery(
                dsl = dsl,
                graph = this,
                query = dsl.selectQuery(),
                parameters = parameters
        )
        result.query.addFrom(from)
        return result
    }
}
