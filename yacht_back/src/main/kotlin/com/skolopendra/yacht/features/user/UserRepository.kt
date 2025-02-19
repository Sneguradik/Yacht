package com.skolopendra.yacht.features.user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.sql.Timestamp

@Repository
interface UserRepository : JpaRepository<User, Long> {

    fun findFirstByUsernameIgnoreCase(username: String): User?
    fun findFirstByEmail(email: String): User?
    fun findByIdIn(ids: Collection<Long>): List<User>

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.id = :id")
    fun findByIdWithRoles(id: Long): User?

    fun findFirstByIdAndIsDeletedIsFalse(id: Long): User?
    fun findFirstByUsernameIgnoreCaseAndIsDeletedIsFalse(username: String): User?

}
