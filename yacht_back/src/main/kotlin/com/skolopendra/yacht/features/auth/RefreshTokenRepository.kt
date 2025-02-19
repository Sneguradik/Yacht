package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository

interface RefreshTokenRepository : JpaRepository<RefreshToken, Long> {

    fun findFirstByUser(user: User): RefreshToken?
    fun findFirstByUserOrderByCreatedAtDesc(user: User): RefreshToken?
    fun findFirstByRefreshTokenAndUserOrderByCreatedAtDesc(token: String, user: User): RefreshToken?
}
