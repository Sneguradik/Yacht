package com.skolopendra.yacht.features.company

import com.skolopendra.lib.graph.GraphQuery

interface CompanyApplicationRepositoryCustom {
    fun graph(forUser: Long? = null): GraphQuery
}