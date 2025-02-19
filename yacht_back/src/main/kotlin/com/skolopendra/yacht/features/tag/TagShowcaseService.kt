package com.skolopendra.yacht.features.tag

import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemStatService
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemType
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.springframework.stereotype.Service

@Service
class TagShowcaseService(
    private val tagNonUniqueViewService: TagNonUniqueViewService,
    private val showcaseStaticItemStatService: ShowcaseStaticItemStatService,
    private val dsl: DSLContext
) {

    fun upsertShowcaseTagStats(id: Long, viewsOffset: Long = 0, postsOffset: Long = 0) {
        val postsCount = dsl
            .selectCount()
            .from(Tables.ARTICLE_TAG)
            .innerJoin(Tables.ARTICLE)
            .on(Tables.ARTICLE.ID.eq(Tables.ARTICLE_TAG.ARTICLE_ID), Tables.ARTICLE.isPublished())
            .where(Tables.ARTICLE_TAG.TAG_ID.eq(id))
            .fetchOne()?.value1() ?: 0

        showcaseStaticItemStatService.upsertStats(
            id,
            itemType = ShowcaseStaticItemType.TAG,
            currentViewsCount = tagNonUniqueViewService.countByTag(id) + viewsOffset,
            currentPostsCount = postsCount.toLong() + postsOffset
        )
    }
}
