package com.skolopendra.yacht.access

import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.auth.currentUserId
import org.springframework.stereotype.Component

@Component("publicationSecurityService")
class SecurityService {
    fun isAuthor(publication: Publication): Boolean =
            publication.author.id == currentUserId()
}