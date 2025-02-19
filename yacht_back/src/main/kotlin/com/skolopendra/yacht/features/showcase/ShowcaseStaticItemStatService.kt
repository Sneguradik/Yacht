package com.skolopendra.yacht.features.showcase


import org.springframework.stereotype.Service
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Service
class ShowcaseStaticItemStatService(
    val showcaseStaticItemStatRepository: ShowcaseStaticItemStatRepository,
    val showcaseStaticItemRepository: ShowcaseStaticItemRepository
) {

    @PersistenceContext
    lateinit var entityManager: EntityManager

    fun upsertStats(
        itemId: Long,
        itemType: ShowcaseStaticItemType,
        currentViewsCount: Long = 0,
        currentPostsCount: Long = 0,
        currentSubscribersCount: Long = 0
    ) {
        val itemRef = showcaseStaticItemRepository.findFirstByItemIdAndItemType(itemId, itemType)
        if (itemRef != null) {
            val statView = showcaseStaticItemStatRepository.findFirstByItem(itemRef)
            showcaseStaticItemStatRepository.save(statView?.apply {
                if (currentViewsCount != 0L) {
                    this.viewsCount = currentViewsCount
                }
                if (currentPostsCount != 0L) {
                    this.postsCount = currentPostsCount
                }
                if (currentSubscribersCount != 0L) {
                    this.subscribersCount = currentSubscribersCount
                }
            } ?: ShowcaseStaticItemStat(item = itemRef, itemType = itemType).apply {
                if (currentViewsCount != 0L) {
                    this.viewsCount = currentViewsCount
                }
                if (currentPostsCount != 0L) {
                    this.postsCount = currentPostsCount
                }
                if (currentSubscribersCount != 0L) {
                    this.subscribersCount = currentSubscribersCount
                }
            })
        }
    }
}
