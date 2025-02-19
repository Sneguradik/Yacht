package com.skolopendra.yacht.service.social

import com.skolopendra.yacht.features.auth.SocialAuthenticationPrincipal
import java.net.URL

interface ISocialAuthenticationService<T> {
    fun getPrincipal(data: T): SocialAuthenticationPrincipal
    fun getInfo(principal: SocialAuthenticationPrincipal): UserInfo

    data class UserInfo(val firstName: String, val lastName: String, val pictureUrl: URL?)
}