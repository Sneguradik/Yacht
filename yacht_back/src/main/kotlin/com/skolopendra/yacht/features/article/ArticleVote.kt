package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.entity.vote.Vote
import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.SQLInsert
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(
        name = "article_vote",
        uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "article_id"])]
)
@SQLInsert(sql = "INSERT INTO article_vote (user_id, value, article_id, created_at) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, article_id) DO UPDATE SET value = EXCLUDED.value")
class ArticleVote(
        value: Short,
        user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "article_id")
        val article: Article,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0)
) : Vote(value = value, user = user)
