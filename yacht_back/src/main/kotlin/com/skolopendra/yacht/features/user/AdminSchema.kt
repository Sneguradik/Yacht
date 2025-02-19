package com.skolopendra.yacht.features.user

data class AdminSchema(
        val count: UsersCount,
        val registrations: UsersCount,
        val presence: UsersCount,
        val activity: UsersCount,
        val materials: UsersMaterials

)

data class UsersCount(
        val all: Int? = null,
        val users: Int? = null,
        val companies: Int? = null
)

data class UsersMaterials(
        val all: UsersMaterialsCount,
        val users: UsersMaterialsCount,
        val companies: UsersMaterialsCount
)


data class UsersMaterialsCount(
        val articles: Int,
        val comments: Int,
        val news: Int
)
