package com.skolopendra.yacht.features.user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRecoveryRepository : JpaRepository<UserRecovery, Long>{
    fun findByUserAndUsedIsFalse(user: User): UserRecovery?
    fun findFirstByUserOrderByUsedAt(user: User): UserRecovery?
}
