package com.skolopendra.yacht.entity

import com.skolopendra.yacht.features.article.Article
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.persistence.MapsId

@Entity
class FrontPageStory(
        @Id
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @ManyToOne
        @MapsId
        val article: Article
)