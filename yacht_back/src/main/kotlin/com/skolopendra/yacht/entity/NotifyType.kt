package com.skolopendra.yacht.entity

import java.util.*
import javax.persistence.AttributeConverter
import javax.persistence.Converter


enum class NotifyType(val type: String) {

    EVENT_TYPE("new_subscriber"),
    NOTIFY_REPORT("content_report"),
    BOOKMARKED_POST_COMMENT("bookmark_comment"),
    AUTHORED_POST_COMMENT("post_comment"),
    COMMENT_MENTION("comment_mention"),

    REPLY("comment_reply"),
    WATCHED_COMMENT_REPLY("watched_comment_reply"),

    NOTIFY_SUBMITTED("post_submitted"),
    NOTIFY_BLOCKED("mod_post_blocked"),
    NOTIFY_REVIEWING("post_reviewing"),
    NOTIFY_DRAFTED("post_drafted"),

    BANNED("account_banned"),
    UNBANNED("account_unbanned"),
    NOTIFY_UNBLOCKED("mod_post_unblocked"),
    NOTIFY_PUBLISHED("mod_post_published"),
    NOTIFY_WITHDRAWN("mod_post_withdrawn"),
    NOTIFY_DELETED("post_deleted"),
    NOTIFY_MOD_DELETED("mod_post_deleted"),
    NOTIFY_EDITOR_MESSAGE("editor_message");
}

@Converter(autoApply = true)
class NotifyTypeConverter : AttributeConverter<NotifyType?, String?> {
    override fun convertToDatabaseColumn(notifyType: NotifyType?): String? {
        return notifyType?.type
    }

    override fun convertToEntityAttribute(code: String?): NotifyType? {
        return if (code == null) {
            null
        } else NotifyType.values().first {
            it.type == code
        }
    }
}

enum class NotifyGroup {
    EVERYTHING,
    UNREAD,
    SYSTEM_GROUP,
    COMMENTS_GROUP,
    PUBLICATIONS_GROUP
}

class Notify {
    companion object {
        val basicTypes: EnumSet<NotifyType> = EnumSet.of(
                NotifyType.BANNED,
                NotifyType.UNBANNED,
                NotifyType.NOTIFY_UNBLOCKED,
                NotifyType.NOTIFY_PUBLISHED,
                NotifyType.NOTIFY_WITHDRAWN,
                NotifyType.NOTIFY_DELETED,
                NotifyType.NOTIFY_MOD_DELETED
        )
        val basicTypesString = basicTypes.map {
            it.type
        }

        /*
         * 1. У Вас новый подписчик
         * 2. Сообщение от редакции портала
         * 3. Поступила жалоба от другого пользователя
         * 4. Функционал Вашего профиля восстановлен
         * 5. Функционал Вашего профиля ограничен
         *
         * 4,5 - базовый функционал, но добавлено
         */
        val systemTypes: EnumSet<NotifyType> =
                EnumSet.of(
                        NotifyType.EVENT_TYPE,
                        NotifyType.NOTIFY_REPORT,
                        NotifyType.BANNED,
                        NotifyType.UNBANNED,
                        NotifyType.NOTIFY_EDITOR_MESSAGE
                )
        val systemTypesString = systemTypes.map {
            it.type
        }

        /*
         * 1. Новый комментарий к публикации из Вашего избранного
         * 2. Новый ответ к Вашему комментарию
         * 3. Новый комментарий к Вашей публикации
         * 4. Упоминание о Вас другим пользователем
         *
         * 1, 3 видимо одно и тоже, ибо связанность в файлах BookmarkController и ArticleController никак не проверяются
         * и Notifications создаются без учета параметров, кхм
         */
        val commentsTypes: EnumSet<NotifyType> =
                EnumSet.of(
                        NotifyType.REPLY,
                        NotifyType.WATCHED_COMMENT_REPLY,
                        NotifyType.COMMENT_MENTION,
                        NotifyType.BOOKMARKED_POST_COMMENT,
                        NotifyType.AUTHORED_POST_COMMENT
                )
        val commentsTypesString = commentsTypes.map {
            it.type
        }

        /*
         * 1. Ваша публикация размещена
         * 2. Ваша публикация проходит модерацию
         * 3. Ваша публикация перемещена в черновики
         * 4. Ваша публикация заблокирована редактором
         * 5. Публикация удалена
         *
         * Последнее добавлено без учета условий документации, ибо оно базовое
         */
        val notTypes: EnumSet<NotifyType> =
                EnumSet.of(
                        NotifyType.NOTIFY_UNBLOCKED,
                        NotifyType.NOTIFY_PUBLISHED,
                        NotifyType.NOTIFY_WITHDRAWN,
                        NotifyType.NOTIFY_DELETED,
                        NotifyType.NOTIFY_MOD_DELETED,
                        NotifyType.NOTIFY_SUBMITTED,
                        NotifyType.NOTIFY_BLOCKED,
                        NotifyType.NOTIFY_REVIEWING,
                        NotifyType.NOTIFY_DRAFTED
                )
        val notTypesString = notTypes.map {
            it.type
        }
    }
}