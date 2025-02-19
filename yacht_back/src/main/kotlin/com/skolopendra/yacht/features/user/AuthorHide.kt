package com.skolopendra.yacht.features.user

import org.hibernate.annotations.CreationTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "author_hide")
class AuthorHide(
        @EmbeddedId
        val id: AuthorHideId,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("userId")
        val user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("authorId")
        val author: User
) {
    constructor(user: User, author: User) : this(AuthorHideId(user.id, author.id), user = user, author = author)
}
