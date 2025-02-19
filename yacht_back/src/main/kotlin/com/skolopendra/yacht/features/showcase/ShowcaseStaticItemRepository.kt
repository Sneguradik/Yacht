package com.skolopendra.yacht.features.showcase

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ShowcaseStaticItemRepository : JpaRepository<ShowcaseStaticItem, Long> {
    fun findFirstByItemIdAndItemType(itemId: Long, itemType: ShowcaseStaticItemType): ShowcaseStaticItem?
    fun findAllByItemType(itemType: ShowcaseStaticItemType): List<ShowcaseStaticItem>
}