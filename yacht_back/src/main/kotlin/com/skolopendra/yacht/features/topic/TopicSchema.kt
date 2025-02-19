package com.skolopendra.yacht.features.topic

import com.skolopendra.lib.graph.Graph
import com.skolopendra.lib.graph.StoredJoin
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.util.joinType
import org.jooq.impl.DSL

class TopicSchema {
    companion object {
        private val t = Tables.TOPIC
        private val a = Tables.ARTICLE
        private val at = Tables.ARTICLE_TOPIC
        private val ts = Tables.TOPIC_SUBSCRIPTION
        private val u = Tables.USER

        val GRAPH = (Graph on t) {
            "meta" embed {
                "id" from t.ID
                "createdAt" from t.CREATED_AT
                "updatedAt" from t.UPDATED_AT
            }
            "info" embed {
                "name" from t.NAME
                "picture" from t.IMAGE
                "description" from t.DESCRIPTION
                "url" from t.URL
            }
            "profile" embed {
                "cover" from t.PROFILE_COVER_URL
                "fullDescription" from t.DESCRIPTION_FULL
            }
            "subscribers" embed {
                "count" counts ts.where(ts.TOPIC_ID.eq(t.ID))
                "you" by { user: Long?, sub: Boolean? ->
                    if (user == null)
                        nil()
                    else
                        (if (sub != null) const(sub) else jooq(DSL.field(ts.ID.isNotNull))) using StoredJoin(ts, joinType(sub), ts.TOPIC_ID.eq(t.ID), ts.USER_ID.eq(user))
                }
            }
            "postCount" from jooq(DSL.selectCount().from(Tables.ARTICLE).where(a.isPublished(), DSL.exists(DSL.selectOne().from(at).where(at.ARTICLE_ID.eq(a.ID), at.TOPIC_ID.eq(t.ID)))).asField<Long>())
            "hidden" by { user: Long?, hidden: Boolean? ->
                if (user == null)
                    nil()
                else
                    (if (hidden != null) const(hidden) else jooq(DSL.field(Tables.TOPIC_HIDE.USER_ID.isNotNull))) using StoredJoin(Tables.TOPIC_HIDE, joinType(hidden), Tables.TOPIC_HIDE.TOPIC_ID.eq(Tables.TOPIC.ID), Tables.TOPIC_HIDE.USER_ID.eq(user))
            }
        }

        val SHORT = selectTree {
            "meta" { +"id"; +"createdAt"; +"updatedAt" }
            "info" {
                +"name"
                +"picture"
                +"description"
                +"url"
            }
        }

        val PREVIEW = SHORT with {
            "subscribers" {
                +"count"
                +"you"
            }
            +"postCount"
            +"hidden"
        }

        val FULL = PREVIEW with {
            "profile" {
                +"cover"
                +"fullDescription"
            }
        }
    }
}
