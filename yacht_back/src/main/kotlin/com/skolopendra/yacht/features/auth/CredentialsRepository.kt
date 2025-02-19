package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.AccountOrigin
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface CredentialsRepository : JpaRepository<Credentials, UUID> {
    fun findFirstByOriginAndServiceId(origin: AccountOrigin, serviceId: String): Credentials?
}