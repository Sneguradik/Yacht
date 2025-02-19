package com.skolopendra.lib.graph.items

import com.skolopendra.lib.graph.GraphResultMappingOptions
import com.skolopendra.lib.graph.SelectTreeNode
import com.skolopendra.lib.graph.StoredJoin
import org.jooq.Record
import org.jooq.SelectFieldOrAsterisk

class ParameterizedSelect(
        private val fn: Function<IResolvable>
) : IResolvable {
    private fun unwrap(parameters: Map<String, Any?>?): IResolvable {
        if (parameters == null)
            throw IllegalStateException("no unwrapped resolvable")
        val invoke = this.fn.javaClass.declaredMethods.find { it.name == "invoke" && IResolvable::class.java.isAssignableFrom(it.returnType) }
                ?: throw IllegalStateException("cannot find invoke method")
        val params = mutableListOf<Any?>()
        for (param in invoke.parameters) {
            if (!parameters.containsKey(param.name))
                throw IllegalStateException("missing parameter ${param.name}")
            val cfg = parameters[param.name]
            if (cfg != null && !param.type.isAssignableFrom(cfg.javaClass))
                throw IllegalStateException("type not assignable - got ${cfg.javaClass} when expecting ${param.type}")
            params.add(cfg)
        }
        invoke.isAccessible = true
        return invoke.invoke(fn, *params.toTypedArray()) as IResolvable
    }

    override fun joins(parameters: Map<String, Any?>, node: SelectTreeNode): Collection<StoredJoin> {
        return unwrap(parameters).joins(parameters, node)
    }

    override fun select(parameters: Map<String, Any?>, node: SelectTreeNode): List<SelectFieldOrAsterisk> {
        return unwrap(parameters).select(parameters, node)
    }

    override fun fetch(parameters: Map<String, Any?>, node: SelectTreeNode, record: Record, options: GraphResultMappingOptions): Any? {
        return unwrap(parameters).fetch(parameters, node, record, options)
    }
}