package com.skolopendra.yacht.features.user

import com.skolopendra.lib.ImageUploadService
import com.skolopendra.lib.ObjectPatcher
import com.skolopendra.yacht.AccountOrigin
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.event.UserSubscribedEvent
import com.skolopendra.yacht.features.auth.Credentials
import com.skolopendra.yacht.features.topic.Topic
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.social.FacebookService
import org.hibernate.Hibernate
import org.jooq.DSLContext
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.awt.image.BufferedImage
import java.net.URL
import java.sql.Timestamp
import javax.imageio.ImageIO
import javax.persistence.EntityManager
import javax.persistence.LockModeType
import javax.persistence.PersistenceContext
import javax.validation.Validator

@Service
class UserService(
    private val validator: Validator,
    private val userRepository: UserRepository,
    private val imageUploadService: ImageUploadService,
    private val passwordEncoder: PasswordEncoder,
    private val authorSubscriptionRepository: AuthorSubscriptionRepository,
    private val eventPublisher: ApplicationEventPublisher,
    private val facebookService: FacebookService,
    private val dsl: DSLContext
) {

    @PersistenceContext
    lateinit var entityManager: EntityManager

    @Transactional
    fun changeUsername(user: User, username: String?) {
        if (username != null) {
            val conflictingUser = userRepository.findFirstByUsernameIgnoreCase(username)
            require(conflictingUser == null) { "Username already taken" }
        }
        Hibernate.initialize(user.credentials)
        val currentPassword =
            user.credentials.filter { it.origin == AccountOrigin.LOCAL }.mapNotNull { it.password }.firstOrNull()
        if (user.username != null)
            user.credentials.removeIf { it.origin == AccountOrigin.LOCAL && it.serviceId == user.username }
        user.username = username
        if (username != null)
            user.credentials.add(
                Credentials(
                    user = user,
                    origin = AccountOrigin.LOCAL,
                    serviceId = username,
                    password = currentPassword
                )
            )
        userRepository.save(user)
    }

    @Transactional
    fun changePicture(user: User, image: BufferedImage) {
        entityManager.lock(user, LockModeType.PESSIMISTIC_WRITE)
        entityManager.refresh(user)
        user.profilePictureUrl = imageUploadService.cropToCenterSquareAndUpload(200, image)
        userRepository.save(user)
    }

    @Transactional
    fun deletePicture(user: User) {
        entityManager.lock(user, LockModeType.PESSIMISTIC_WRITE)
        entityManager.refresh(user)
        user.profilePictureUrl = null
        userRepository.save(user)
    }

    /*
        TODO: changePicture and changeCover have the same logic
    */
    @Transactional
    fun changeCover(user: User, file: MultipartFile?) {
        entityManager.lock(user, LockModeType.PESSIMISTIC_WRITE)
        entityManager.refresh(user)
        user.profileCoverUrl = if (file != null) {
            imageUploadService.resizeToFixedSize(700, 265, ImageIO.read(file.inputStream))
        } else {
            ""
        }
        userRepository.save(user)
    }

    /*
        TODO: New e-mail needs to be confirmed before it is changed
     */
    @Transactional
    fun changeAddress(user: User, email: String) {
        val conflictingUser = userRepository.findFirstByEmail(email)
        require(conflictingUser == null) { "User with that email already exists" }
        Hibernate.initialize(user.credentials)
        val currentPassword =
            user.credentials.filter { it.origin == AccountOrigin.LOCAL }.mapNotNull { it.password }.firstOrNull()
        if (user.email != null)
            user.credentials.removeIf { it.origin == AccountOrigin.LOCAL && it.serviceId == user.email }
        user.email = email
        user.credentials.add(
            Credentials(
                user = user,
                origin = AccountOrigin.LOCAL,
                serviceId = email,
                password = currentPassword
            )
        )
        userRepository.save(user)
    }

    @Transactional
    fun changePassword(user: User, password: String) {
        val passwordHash = passwordEncoder.encode(password)
        user.credentials.filter { it.origin == AccountOrigin.LOCAL }.forEach { it.password = passwordHash }
        userRepository.save(user)
    }

    fun patch(user: User, patch: Map<String, Any?>): User {
        return userRepository.save(ObjectPatcher(user, validator).apply(patch))
    }

    fun userSubscribe(user: User, target: User) {
        authorSubscriptionRepository.save(AuthorSubscription(user, target))
        eventPublisher.publishEvent(UserSubscribedEvent(target, user))
    }

    @Transactional
    fun userUnsubscribe(user: User, target: User) {
        authorSubscriptionRepository.deleteByUserAndAuthor(user, target)
    }

    fun getCountOfSubscribers(user: User): Long {
        return authorSubscriptionRepository.countByAuthor(user)
    }

    fun importPictureFromFacebook(user: User, body: FacebookService.FacebookAuth) {
        val signedRequest = facebookService.getSignedRequest(body.signedRequest)
        val url = facebookService.getProfilePictureUrl(signedRequest.userId)
        val image = ImageIO.read(URL(url))
        user.profilePictureUrl = imageUploadService.cropToCenterSquareAndUpload(200, image)
        userRepository.save(user)
    }

    // Thou shalt not take the name of the Lord thy God in vain
    // TODO: Optimize
    fun getUserActivities(after: Timestamp, before: Timestamp): AdminSchema {
        val users = dsl.selectCount().from(Tables.USER).where(Tables.USER.IS_COMPANY.isFalse).fetchOne()?.value1()
        val companies = dsl.selectCount().from(Tables.USER).where(Tables.USER.IS_COMPANY.isTrue).fetchOne()?.value1()
        val allUsers = companies?.let { users?.plus(it) }

        // Начало сегмента период
        // Регистрации
        val usersFiltered = dsl.selectCount().from(Tables.USER)
            .where(Tables.USER.CREATED_AT.between(after.toLocalDateTime(), before.toLocalDateTime()))
            .and(Tables.USER.IS_COMPANY.isFalse)
            .fetchOne()
            ?.value1()
        val companiesFiltered = dsl.selectCount().from(Tables.USER)
            .where(Tables.USER.CREATED_AT.between(after.toLocalDateTime(), before.toLocalDateTime()))
            .and(Tables.USER.IS_COMPANY.isTrue)
            .fetchOne()
            ?.value1()
        val allUsersFiltered = companiesFiltered?.let { usersFiltered?.plus(it) }

        // Публикации и комментарии
        // Пользователи
        val commentsUsers = queryForComments(true, after, before)
        val articlesUsers = queryForArticles(true, after, before)

        // Компании
        val commentsCompanies = queryForComments(false, after, before)
        val articlesCompanies = queryForArticles(false, after, before)

        // Новости
        // TODO: Стоит ли зафиксировать название новостей в конфигурации?
        val newsUsers = queryForNews(true, after, before)
        val newsCompanies = queryForNews(false, after, before)

        // Материалы
        val commentsAllUsersCount = commentsUsers.plus(commentsCompanies)
        val articlesAllUsersCount = articlesUsers.plus(articlesCompanies)
        val newsAllUsersCount = newsUsers.plus(newsCompanies)

        // Активность
        val activityCompanies = queryForUsersActivity(false, after, before)
        val activityUsers = queryForUsersActivity(true, after, before)
        val allUsersActivity = activityUsers.plus(activityCompanies)

        return AdminSchema(
            count = UsersCount(allUsers, users, companies),
            registrations = UsersCount(allUsersFiltered, usersFiltered, companiesFiltered),
            presence = UsersCount(allUsersActivity, activityUsers, activityCompanies),
            activity = UsersCount(articlesUsers + articlesCompanies, articlesUsers, articlesCompanies),
            materials = UsersMaterials(
                all = UsersMaterialsCount(articlesAllUsersCount, commentsAllUsersCount, newsAllUsersCount),
                companies = UsersMaterialsCount(articlesCompanies, commentsCompanies, newsCompanies),
                users = UsersMaterialsCount(articlesUsers, commentsUsers, newsUsers)
            )
        )
    }

    fun getUserByIdOrNull(id: Long): User? = userRepository.findByIdOrNull(id)

    fun saveUser(user: User): User = userRepository.save(user)

    private fun queryForComments(user: Boolean, after: Timestamp, before: Timestamp): Int =
        checkNotNull(
            dsl.selectCount().from(Tables.COMMENT)
                .leftJoin(Tables.USER)
                .on(Tables.USER.ID.eq(Tables.COMMENT.AUTHOR_ID))
                .where(
                    if (user) Tables.USER.IS_COMPANY.isFalse
                    else Tables.USER.IS_COMPANY.isTrue
                )
                .and(Tables.COMMENT.CREATED_AT.between(after.toLocalDateTime()).and(before.toLocalDateTime()))
                .fetchOne()
        ).value1()

    private fun queryForArticles(user: Boolean, after: Timestamp, before: Timestamp): Int =
        checkNotNull(
            dsl.selectCount().from(Tables.ARTICLE)
                .leftJoin(Tables.USER)
                .on(Tables.USER.ID.eq(Tables.ARTICLE.AUTHOR_ID))
                .where(
                    if (user) Tables.USER.IS_COMPANY.isFalse
                    else Tables.USER.IS_COMPANY.isTrue
                )
                .and(Tables.ARTICLE.PUBLICATION_STAGE.eq(Publication.Stage.PUBLISHED.ordinal))
                .and(Tables.ARTICLE.PUBLISHED_AT.between(after.toLocalDateTime()).and(before.toLocalDateTime()))
                .fetchOne()
        ).value1()

    private fun queryForNews(user: Boolean, after: Timestamp, before: Timestamp): Int =
        checkNotNull(
            dsl.selectCount().from(Tables.ARTICLE)
                .leftJoin(Tables.ARTICLE_TOPIC)
                .on(Tables.ARTICLE.ID.eq(Tables.ARTICLE_TOPIC.ARTICLE_ID))
                .leftJoin(Tables.USER)
                .on(Tables.USER.ID.eq(Tables.ARTICLE.AUTHOR_ID))
                .where(
                    if (user) Tables.USER.IS_COMPANY.isFalse
                    else Tables.USER.IS_COMPANY.isTrue
                )
                .and(
                    Tables.ARTICLE_TOPIC.TOPIC_ID.eq(
                        dsl.select(Tables.TOPIC.ID).from(Tables.TOPIC)
                            .where(Tables.TOPIC.NAME.eq("Новости"))
                            .fetchOne()
                            ?.value1()
                    )
                )
                .and(Tables.ARTICLE.PUBLISHED_AT.between(after.toLocalDateTime()).and(before.toLocalDateTime()))
                .fetchOne()
        ).value1()

    private fun queryForUsersActivity(user: Boolean, after: Timestamp, before: Timestamp): Int =
        checkNotNull(
            dsl.selectCount().from(Tables.REFRESH_TOKENS)
                .leftJoin(Tables.USER)
                .on(Tables.USER.ID.eq(Tables.REFRESH_TOKENS.USER_ID))
                .where(
                    if (user) Tables.USER.IS_COMPANY.isFalse
                    else Tables.USER.IS_COMPANY.isTrue
                )
                .and(Tables.REFRESH_TOKENS.UPDATED_AT.between(after.toLocalDateTime()).and(before.toLocalDateTime()))
                .fetchOne()
        ).value1()

}
