package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.AccountOrigin

data class SocialAuthenticationPrincipal(
    val origin: AccountOrigin,
    val serviceId: String,
    val serviceLoginData: Any? = null
)
