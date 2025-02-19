package com.skolopendra.yacht.features.user

import com.skolopendra.lib.graph.Graph
import com.skolopendra.lib.graph.StoredJoin
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.util.joinType
import org.jooq.JoinType
import org.jooq.impl.DSL

class UserSchema {
    companion object {
        val GRAPH = (Graph on Tables.USER) {
            val u = Tables.USER

            val rolesTable = DSL.select(
                DSL.function(
                    "array_to_string", String::class.java,
                    DSL.function("array_agg", String::class.java, Tables.USER_ROLE.ROLE_NAME), DSL.value(",")
                ).`as`("roles_join"), Tables.USER_ROLE.USER_ID.`as`("user_id")
            ).from(Tables.USER_ROLE).groupBy(Tables.USER_ROLE.USER_ID)
            val rolesJoin = StoredJoin(
                rolesTable,
                JoinType.LEFT_OUTER_JOIN,
                checkNotNull(rolesTable.field("user_id", Long::class.java)).eq(Tables.USER.ID)
            )
            val ratingJoin =
                StoredJoin(Tables.USER_RATING, JoinType.LEFT_OUTER_JOIN, Tables.USER_RATING.ID.eq(Tables.USER.ID))

            "meta" embed {
                "id" from u.ID
                "createdAt" from u.CREATED_AT
                "updatedAt" from u.UPDATED_AT
            }
            "subscribers" embed {
                "count" counts Tables.AUTHOR_SUBSCRIPTION.where(u.ID.eq(Tables.AUTHOR_SUBSCRIPTION.AUTHOR_ID))
                "you" by { user: Long?, sub: Boolean? ->
                    if (user == null)
                        nil()
                    else
                        (if (sub != null) const(sub) else jooq(DSL.field(Tables.AUTHOR_SUBSCRIPTION.ID.isNotNull))) using StoredJoin(
                            Tables.AUTHOR_SUBSCRIPTION,
                            joinType(sub),
                            Tables.AUTHOR_SUBSCRIPTION.AUTHOR_ID.eq(Tables.USER.ID),
                            Tables.AUTHOR_SUBSCRIPTION.USER_ID.eq(user)
                        )
                }
            }
            "info" embed {
                "firstName" from u.FIRST_NAME
                "lastName" from u.LAST_NAME
                "username" from u.USERNAME
                "picture" from u.PROFILE_PICTURE_URL
                "bio" from u.BIO
                "company" embed {
                    "confirmed" from u.COMPANY_CONFIRMED
                    "isCompany" from u.IS_COMPANY
                    "name" from u.COMPANY_NAME
                }
            }
            "contacts" embed {
                "email" from u.CONTACT_EMAIL
                "phone" from u.CONTACT_PHONE
                "phoneAlt" from u.CONTACT_PHONE_ALT
                "websiteUrl" from u.CONTACT_WEBSITE_URL
                "geolocation" from u.GEOLOCATION
                "instagram" from u.CONTACT_SOCIAL_INSTAGRAM
                "vk" from u.CONTACT_SOCIAL_VK
                "facebook" from u.CONTACT_SOCIAL_FACEBOOK
                "twitter" from u.CONTACT_SOCIAL_TWITTER
                "youtube" from u.CONTACT_SOCIAL_YOUTUBE
                "linkedIn" from u.CONTACT_SOCIAL_LINKEDIN
                "telegram" from u.CONTACT_SOCIAL_TELEGRAM
            }
            "profile" embed {
                "cover" from u.PROFILE_COVER_URL
                "fullDescription" from u.DESCRIPTION_FULL
            }
            "rating" from (Tables.USER_RATING.SCORE using ratingJoin mapNull { rating: Double? -> rating ?: 0.0 })
            "postCount" counts Tables.ARTICLE.where(Tables.ARTICLE.AUTHOR_ID.eq(u.ID), Tables.ARTICLE.isPublished())
            "privateEmail" from u.EMAIL
            "roles" from (checkNotNull(
                rolesTable.field(
                    "roles_join",
                    String::class.java
                )
            ) using rolesJoin map { roles: String -> roles.split(',') })
            "jobCount" counts Tables.JOB.where(
                Tables.JOB.COMPANY_ID.eq(u.ID),
                Tables.JOB.PUBLICATION_STAGE.eq(Publication.Stage.PUBLISHED.ordinal)
            )
            "eventCount" counts Tables.EVENT.where(
                Tables.EVENT.COMPANY_ID.eq(u.ID),
                Tables.EVENT.PUBLICATION_STAGE.eq(Publication.Stage.PUBLISHED.ordinal)
            )
            "banned" from u.IS_BANNED
            "pinned" from u.IS_PINNED
            "hidden" by { user: Long?, hidden: Boolean? ->
                if (user == null)
                    nil()
                else
                    (if (hidden != null) const(hidden) else jooq(DSL.field(Tables.AUTHOR_HIDE.USER_ID.isNotNull))) using StoredJoin(
                        Tables.AUTHOR_HIDE,
                        joinType(hidden),
                        Tables.AUTHOR_HIDE.AUTHOR_ID.eq(Tables.USER.ID),
                        Tables.AUTHOR_HIDE.USER_ID.eq(user)
                    )
            }
        }
    }
}
