package com.skolopendra.lib.graph

class SelectTreeNode(
        val name: String,
        val children: MutableList<SelectTreeNode> = mutableListOf()
) {
    operator fun String.unaryPlus() {
        children.add(SelectTreeNode(this))
    }

    operator fun String.invoke(block: SelectTreeNode.() -> Unit) {
        val existing = children.find { it.name == this }
        if (existing != null)
            existing.apply(block)
        else
            children.add(SelectTreeNode(this).apply(block))
    }

    operator fun String.invoke(node: SelectTreeNode) {
        children.add(SelectTreeNode(this, node.children))
    }

    fun clone(): SelectTreeNode =
            SelectTreeNode(name, children.map { it.clone() }.toMutableList())

    infix fun with(block: SelectTreeNode.() -> Unit): SelectTreeNode = clone().apply(block)
}