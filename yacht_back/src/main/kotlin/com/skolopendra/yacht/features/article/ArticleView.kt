package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.SQLInsert
import java.sql.Timestamp
import javax.persistence.*

/**
 * Used to determine if article was viewed by user, and how many times article was viewed in total
 * TODO: Store anonymous views
 */
@Entity
@Table(
        name = "article_view",
        uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "article_id"]),
            UniqueConstraint(columnNames = ["fingerprint", "article_id"])]
)
@SQLInsert(sql = "INSERT INTO article_view (article_id, fingerprint, user_id, created_at) VALUES (?, ?, ?, now()) ON CONFLICT DO NOTHING")
class ArticleView(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @Column(nullable = true)
        val fingerprint: String?,

        @Column(name = "created_at", nullable = true, updatable = false, insertable = false)
        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = true, fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        val user: User?,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "article_id")
        val article: Article
)
