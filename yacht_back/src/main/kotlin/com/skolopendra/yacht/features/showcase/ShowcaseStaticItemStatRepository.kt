package com.skolopendra.yacht.features.showcase

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ShowcaseStaticItemStatRepository : JpaRepository<ShowcaseStaticItemStat, ShowcaseStaticItemStatId> {

    fun findFirstByItem(item: ShowcaseStaticItem): ShowcaseStaticItemStat?
}