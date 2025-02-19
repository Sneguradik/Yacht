package com.skolopendra.yacht.features.article

import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*
import javax.validation.constraints.Pattern

@Entity
@Table(name = "article_promotion_list")
class ArticlePromotionList(
        @get:Pattern(regexp = "^[a-z_0-9\\-]{1,32}$")
        @Id
        val id: String,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @OneToMany(mappedBy = "promotionList", fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
        val promotionListItem: MutableSet<ArticlePromotionListItem> = mutableSetOf()
)