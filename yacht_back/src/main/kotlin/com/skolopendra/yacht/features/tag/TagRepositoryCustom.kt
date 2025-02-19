package com.skolopendra.yacht.features.tag

import com.skolopendra.lib.graph.GraphQuery

interface TagRepositoryCustom {
    fun graph(forUser: Long?): GraphQuery
}