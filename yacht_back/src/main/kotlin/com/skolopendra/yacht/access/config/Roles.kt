package com.skolopendra.yacht.access.config

class Roles {
    companion object {
        const val USER = "ROLE_USER"
        const val PRIVILEGED_USER = "ROLE_PRIVILEGED_USER"
        const val SALES = "ROLE_SALES"
        const val CHIEF_EDITOR = "ROLE_CHIEF_EDITOR"
        const val SUPERUSER = "ROLE_SUPERUSER"
        const val BANNED_USER = "ROLE_BANNED_USER"

        val ROLE_PRECEDENCE = mapOf<String, Int>(
                BANNED_USER to -10,
                USER to 0,
                PRIVILEGED_USER to 5,
                SALES to 10,
                CHIEF_EDITOR to 100,
                SUPERUSER to 1000
        )
    }
}
