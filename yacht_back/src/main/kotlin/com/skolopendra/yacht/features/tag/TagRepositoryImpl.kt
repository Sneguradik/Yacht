package com.skolopendra.yacht.features.tag

import com.skolopendra.lib.graph.Graph
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.jooq.impl.DSL
import org.springframework.stereotype.Repository

@Repository
class TagRepositoryImpl(
        val dsl: DSLContext
) : TagRepositoryCustom {
    companion object {
        private val t = Tables.TAG
        private val tv = Tables.TAG_VIEW
        private val a = Tables.ARTICLE
        private val at = Tables.ARTICLE_TAG

        val GRAPH = (Graph on Tables.TAG) {
            "meta" embed {
                "id" from t.ID
                "createdAt" from t.CREATED_AT
                "updatedAt" from t.UPDATED_AT
            }
            "views" embed {
                "count" counts tv.where(tv.TAG_ID.eq(t.ID))
            }
            "frequency" from jooq(DSL.selectCount().from(Tables.ARTICLE_TAG).where(at.TAG_ID.eq(t.ID)).asField<Long>().`as`("frequency"))
            "content" from t.CONTENT
            "postCount" from jooq(DSL.selectCount().from(Tables.ARTICLE)
                    .where(a.isPublished(), DSL.exists(DSL.selectOne()
                            .from(at).where(at.ARTICLE_ID.eq(a.ID), at.TAG_ID.eq(t.ID)))).asField<Long>())
        }
    }

    override fun graph(forUser: Long?): GraphQuery =
            GRAPH.create(dsl, mapOf("user" to forUser))
}
