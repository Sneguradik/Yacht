package com.skolopendra.yacht.features.article.comment

import com.skolopendra.yacht.configuration.YachtConfiguration
import com.skolopendra.yacht.event.notification.FullCommentBody
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserRepository
import com.skolopendra.yacht.service.NotificationService
import org.owasp.html.PolicyFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service

@Service
class CommentRenderService(
        private val users: UserRepository,
        private val configuration: YachtConfiguration,
        @Qualifier("stripAllPolicy")
        private val stripAllPolicy: PolicyFactory,
        private val notificationService: NotificationService
) {
    data class MentionContext(val mentions: MutableSet<User> = mutableSetOf())

    companion object {
        val RE_ID_MENTION = Regex("(?<= |^)&#64;id(\\d+)\\b")
        val RE_USERNAME_MENTION = Regex("(?<= |^)&#64;((?!id\\d)[a-zA-Z_][a-zA-Z_0-9]{2,31})\\b")
        val NOTIFICATION = "comment_mention"
    }

    fun mentionHref(user: User, ctx: MentionContext): String {
        val baseUrl = if (user.company.isCompany) configuration.url.companies else configuration.url.users
        val itemUrl = if (user.username != null) user.username!! else "id" + user.id.toString()

        if (ctx.mentions.find { it.id == user.id } == null)
            ctx.mentions.add(user)

        return "${configuration.baseUrl}/$baseUrl/$itemUrl"
    }

    fun userAnchor(user: User?, text: String, ctx: MentionContext) =
            if (user == null) text else "<a href=\"${mentionHref(user, ctx)}\" target=\"_blank\">${text}</a>"

    fun processMentions(text: String, ctx: MentionContext): String {
        return text
                .replace(RE_ID_MENTION) { userAnchor(users.findById(it.groups[1]!!.value.toLong()).orElse(null), it.value, ctx) }
                .replace(RE_USERNAME_MENTION) { userAnchor(users.findFirstByUsernameIgnoreCase(it.groups[1]!!.value), it.value, ctx) }
    }

    fun notifyUser(comment: Comment, user: User) {
        notificationService.sendNotification(user, NOTIFICATION, FullCommentBody(comment))
    }

    fun render(comment: Comment, notify: Boolean): Comment {
        comment.renderedHtml = stripAllPolicy.sanitize(comment.editableData)

        val ctx = MentionContext()
        comment.renderedHtml = processMentions(comment.renderedHtml, ctx)

        if (notify)
            ctx.mentions.take(5).forEach { notifyUser(comment, it) }

        return comment
    }
}