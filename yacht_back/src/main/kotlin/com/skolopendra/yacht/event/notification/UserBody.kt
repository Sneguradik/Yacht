package com.skolopendra.yacht.event.notification

import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserCompanyInfo

class UserBody(
        user: User,
        val id: Long = user.id,
        val info: Info = Info(user)
) : INotification {
    class Info(
            user: User,
            val firstName: String = user.firstName,
            val lastName: String = user.lastName,
            val picture: String? = user.profilePictureUrl,
            val username: String? = user.username,
            val company: UserCompanyInfo = user.company
    )
}