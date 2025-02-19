package com.skolopendra.yacht.features.article

import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.graph.Graph
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.springframework.stereotype.Repository

@Repository
class PromotionListRepositoryImpl(
        val dsl: DSLContext
) : PromotionListRepositoryCustom {
    companion object {
        private val pl = Tables.ARTICLE_PROMOTION_LIST
        private val pli = Tables.ARTICLE_PROMOTION_LIST_ITEM

        val GRAPH = (Graph on pl) {
            "meta" embed {
                "id" from pl.ID
                "createdAt" from pl.CREATED_AT
                "updatedAt" from pl.UPDATED_AT
            }
            "postCount" counts pli.where(pli.LIST_ID.eq(pl.ID))
        }
    }

    override fun graph(): GraphQuery =
            GRAPH.create(dsl, mapOf())
}
