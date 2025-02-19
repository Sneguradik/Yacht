package com.skolopendra.yacht.features.user

import org.springframework.data.jpa.repository.JpaRepository

interface AuthorHideRepository : JpaRepository<AuthorHide, AuthorHideId> {
    fun deleteByUserAndAuthor(user: User, author: User)
    fun findAllByUser(user: User): List<AuthorHide>
}
