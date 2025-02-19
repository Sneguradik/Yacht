package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserService
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.jooq.tables.RefreshTokens
import com.skolopendra.yacht.jooq.tables.records.RefreshTokensRecord
import org.jooq.DSLContext
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.sql.Timestamp

@Service
class RefreshTokenService(
    private val dsl: DSLContext,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val userService: UserService
) {

    private val log = LoggerFactory.getLogger(RefreshTokenService::class.java)

    fun existsByTokenAndUser(refreshToken: String, user: User): Boolean = dsl.fetchExists(
        Tables.REFRESH_TOKENS,
        Tables.REFRESH_TOKENS.REFRESH_TOKEN.eq(refreshToken).and(Tables.REFRESH_TOKENS.USER_ID.eq(user.id))
    )

    fun findTokenByUser(user: User): RefreshToken? =
        refreshTokenRepository.findFirstByUserOrderByCreatedAtDesc(user)

    fun findTokenByCurrentToken(token: String, user: User): RefreshToken? =
        refreshTokenRepository.findFirstByRefreshTokenAndUserOrderByCreatedAtDesc(token, user)

    fun saveOrUpdateToken(newRefreshToken: String, user: User, currentRefreshToken: String? = null) {

        val refreshToken = when (currentRefreshToken) {
            null -> findTokenByUser(user)
            else -> findTokenByCurrentToken(currentRefreshToken, user)
        }

        if (refreshToken != null) {
            refreshToken.user?.lastLogin = if (refreshToken.updatedAt != Timestamp(0))
                refreshToken.updatedAt
            else
                refreshToken.createdAt
            val id = refreshTokenRepository.save(refreshToken.apply {
                this.refreshToken = newRefreshToken
            }).id ?: throw NoSuchElementException("Error updating refresh token: ${user.id}")

            log.debug("Updated refresh token $id")
        } else {
            val token = refreshTokenRepository.save(
                RefreshToken(
                    user = user,
                    refreshToken = newRefreshToken
                )
            )
            token.id ?: throw NoSuchElementException("Error inserting refresh token: ${user.id}")
            userService.saveUser(user.apply {
                lastLogin = token.createdAt
            })
            log.debug("Created refresh token ${token.id}")
        }
    }

}
