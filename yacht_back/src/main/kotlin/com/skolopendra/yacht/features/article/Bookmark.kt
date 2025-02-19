package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(
        name = "bookmark",
        uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "article_id"])]
)
// @SQLInsert(sql = "INSERT INTO bookmark (article_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING") // UPDATE SET created_at = NOW()
class Bookmark(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        val user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "article_id")
        val article: Article
)
