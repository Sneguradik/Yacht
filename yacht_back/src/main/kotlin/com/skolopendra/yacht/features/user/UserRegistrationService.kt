package com.skolopendra.yacht.features.user

import com.skolopendra.lib.ImageUploadService
import com.skolopendra.lib.error.AlreadyExistsException
import com.skolopendra.yacht.AccountOrigin
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.join.UserRole
import com.skolopendra.yacht.event.UserRegisterEvent
import com.skolopendra.yacht.features.auth.Credentials
import com.skolopendra.yacht.features.auth.CredentialsService
import com.skolopendra.yacht.features.auth.SocialAuthenticationPrincipal
import com.skolopendra.yacht.getReference
import com.skolopendra.yacht.service.social.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.net.URL
import java.sql.Timestamp
import java.time.Instant
import javax.imageio.ImageIO
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Service
class UserRegistrationService(
    val vkService: VkService,
    val tgService: TgService,
    val facebookService: FacebookService,
    val googleService: GoogleService,
    val imageUploadService: ImageUploadService,
    val userRepository: UserRepository,
    val passwordEncoder: PasswordEncoder,
    val eventPublisher: ApplicationEventPublisher,
    val credentialsService: CredentialsService
) {
    @PersistenceContext
    lateinit var entityManager: EntityManager

    /**
     * Gets display name and profile picture URL of user from external service
     */
    private fun fetchExternalProfile(principal: SocialAuthenticationPrincipal): ISocialAuthenticationService.UserInfo =
        when (principal.origin) {
            AccountOrigin.GOOGLE -> googleService.getInfo(principal)
            AccountOrigin.FACEBOOK -> facebookService.getInfo(principal)
            AccountOrigin.VK -> vkService.getInfo(principal)
            AccountOrigin.TG -> tgService.getInfo(principal)
            else -> throw IllegalArgumentException("Unexpected user origin")
        }

    @Transactional
    fun createUser(firstName: String, lastName: String, pictureUrl: URL? = null, block: User.() -> Unit): User {
        val user = User(firstName = firstName, lastName = lastName)
        user.apply(block)
        user.roles.add(UserRole(user, entityManager.getReference(Roles.USER)))
        /** Make the first user be admin */
        if (user.id == 1L)
            user.roles.add(UserRole(user, entityManager.getReference(Roles.SUPERUSER)))
        if (pictureUrl != null)
            user.profilePictureUrl = imageUploadService.cropToCenterSquareAndUpload(200, ImageIO.read(pictureUrl))
        return userRepository.save(user)
    }

    @Transactional
    fun socialRegister(principal: SocialAuthenticationPrincipal): User {
        if (credentialsService.socialLogin(principal) != null) throw AlreadyExistsException()
        val info = fetchExternalProfile(principal)
        val temporaryUser =
            createUser(firstName = info.firstName, lastName = info.lastName, pictureUrl = info.pictureUrl) {
                credentials.add(
                    Credentials(
                        user = this,
                        origin = principal.origin,
                        serviceId = principal.serviceId,
                        password = null
                    )
                )
            }
        val user = userRepository.save(temporaryUser)
        eventPublisher.publishEvent(UserRegisterEvent(user))
        return user
    }

    /**
    TODO: Send confirmation email
     */
    @Transactional
    fun classicRegister(firstName: String, lastName: String, username: String?, email: String, password: String): User {
        if (username != null) {
            if (userRepository.findFirstByUsernameIgnoreCase(username) != null) {
                throw AlreadyExistsException("Username already in use")
            }
        }
        if (userRepository.findFirstByEmail(email) != null) {
            throw AlreadyExistsException("Email address already in use")
        }
        val user = createUser(
            firstName = firstName,
            lastName = lastName
        ) {
            this.username = username
            this.email = email
            val passwordHash = passwordEncoder.encode(password)
            if (username != null)
                this.credentials.add(
                    Credentials(
                        user = this,
                        origin = AccountOrigin.LOCAL,
                        serviceId = username,
                        password = passwordHash
                    )
                )
            this.credentials.add(
                Credentials(
                    user = this,
                    origin = AccountOrigin.LOCAL,
                    serviceId = email,
                    password = passwordHash
                )
            )
        }
        eventPublisher.publishEvent(UserRegisterEvent(user))
        return user
    }

    fun saveUser(user: User): User = userRepository.save(user)
}
