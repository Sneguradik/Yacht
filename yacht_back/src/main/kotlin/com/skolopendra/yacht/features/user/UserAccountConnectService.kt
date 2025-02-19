package com.skolopendra.yacht.features.user

import com.skolopendra.lib.error.AlreadyExistsException
import com.skolopendra.yacht.features.auth.Credentials
import com.skolopendra.yacht.features.auth.CredentialsService
import com.skolopendra.yacht.features.auth.SocialAuthenticationPrincipal
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserAccountConnectService(
        private val credentialsService: CredentialsService,
//        private val migrationService: UserMigrationService,
        private val users: UserRepository
) {
//    @PersistenceContext
//    lateinit var entityManager: EntityManager

    @Transactional
    fun connectSocialAccount(master: User, principal: SocialAuthenticationPrincipal) {
        // entityManager.createNativeQuery("SET CONSTRAINTS \"UQ_credentials\" DEFERRED").executeUpdate()
        val slave = credentialsService.socialLogin(principal)
        if (slave != null) {
            throw AlreadyExistsException("Account already exists")
            // migrationService.mergeCredentials(master, slave)
            // migrationService.mergeActivity(master, slave)
        }
//        if (master.credentials.none { it.origin == principal.origin && it.serviceId == principal.serviceId })
        master.credentials.add(Credentials(user = master, origin = principal.origin, serviceId = principal.serviceId, password = null))
        users.save(master)
    }

    /*
    @Transactional
    fun debugMerge(master: User, subject: String, password: String) {
        entityManager.createNativeQuery("SET CONSTRAINTS \"UQ_credentials\" DEFERRED").executeUpdate()
        val slave = credentialsService.login(AccountOrigin.LOCAL, subject, password)
        if (slave != null) {
            migrationService.mergeCredentials(master, slave)
            migrationService.mergeActivity(master, slave)
        }
        if (master.credentials.none { it.origin == AccountOrigin.LOCAL && it.serviceId == subject })
            master.credentials.add(Credentials(user = master, origin = AccountOrigin.LOCAL, serviceId = subject, password = null))
        users.save(master)
    }
     */
}