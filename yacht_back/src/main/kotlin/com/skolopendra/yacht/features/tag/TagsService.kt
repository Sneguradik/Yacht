package com.skolopendra.yacht.features.tag

import com.skolopendra.lib.error.AlreadyExistsException
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.jooq.impl.DSL.count
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.Instant
import javax.persistence.EntityNotFoundException

@Service
class TagsService(
        private val tagViewRepository: TagViewRepository,
        private val tagsRepository: TagRepository,
        private val dsl: DSLContext
) {
    fun getStats(after: Timestamp, before: Timestamp): TagAdmin {
        val t = Tables.TAG
        val tags = dsl.select(
                count(),
                count().filterWhere(t.CREATED_AT.between(after.toLocalDateTime(), before.toLocalDateTime()))
        ).from(t).fetch()

        val (count, filteredCount) = tags[0]

        return TagAdmin(
                count = Tags(count, filteredCount)
        )
    }

    fun createTag(content: String): Long {
        val tagExist = tagsRepository.findByContent(content)
        val tag: Tag

        if (tagExist != null) {
            throw AlreadyExistsException("Tag with $content not found.")
        } else {
            tag = tagsRepository.save(Tag(content = content))
        }

        return tag.id
    }

    fun markViewed(tag: Tag, user: User?, fingerprint: String?) {
        val view = if (user != null)
            tagViewRepository.findFirstByTagAndUser(tag, user)
        else
            tagViewRepository.findFirstByTagAndFingerprint(tag, fingerprint!!)
        if (view != null) {
            view.updatedAt = Timestamp.from(Instant.now())
            tagViewRepository.save(view)
        } else {
            tagViewRepository.save(TagView(fingerprint = fingerprint, user = user, tag = tag))
        }
    }

    @Transactional
    fun remove(id: Long) {
        tagsRepository.deleteById(id)
    }

    fun getOneByContent(content: String): Tag {
        return tagsRepository.findByContent(content) ?: throw EntityNotFoundException("Tag with $content not found")
    }
}
