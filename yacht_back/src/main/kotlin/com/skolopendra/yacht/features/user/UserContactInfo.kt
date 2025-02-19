package com.skolopendra.yacht.features.user

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import com.skolopendra.lib.Patchable
import org.hibernate.validator.constraints.Length
import org.hibernate.validator.constraints.URL
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.validation.constraints.Email

@Embeddable
@Patchable
@JsonInclude(JsonInclude.Include.NON_NULL)
class UserContactInfo(
        @get:Email
        @get:Length(max = 255)
        @Column(name = "contact_email")
        var email: String?,

        @get:URL
        @get:Length(max = 255)
        @Column(name = "contact_website_url")
        var websiteUrl: String?,

        @get:Length(max = 32)
        @Column(name = "contact_phone")
        var phone: String?,

        @get:JsonProperty("phoneAlt")
        @get:Length(max = 32)
        @Column(name = "contact_phone_alt")
        var altPhone: String?,

        @get:JsonProperty("instagram")
        @get:URL(regexp = """(?:(?:http|https)://)?(?:www.)?(?:instagram.com|instagr.am)/([A-Za-z0-9-_.]+)""")
        @get:Length(max = 127)
        @Column(name = "contact_social_instagram")
        var socialInstagram: String?,

        @get:JsonProperty("vk")
        @get:URL(regexp = """^(https?://(m\.)?vk\.com)?/([A-Za-z0-9_.]{2,32})/?${'$'}""")
        @get:Length(max = 127)
        // @get:Pattern()
        @Column(name = "contact_social_vk")
        var socialVk: String?,

        @get:JsonProperty("facebook")
        @get:URL(regexp = """^(?:https?://)?(?:www\.|m\.|mobile\.|touch\.|mbasic\.)?(?:facebook\.com|fb(?:\.me|\.com))/(?!${'$'})(?:(?:\w)*#!/)?(?:pages/)?(?:photo\.php\?fbid=)?(?:[\w\-]*/)*?(?:/)?(?:profile\.php\?id=)?([^/?&\s]*)[/&?]?.*${'$'}""")
        @get:Length(max = 127)
        @Column(name = "contact_social_facebook")
        var socialFacebook: String?,

        @get:JsonProperty("twitter")
        @get:URL(regexp = """^http(?:s)?://(?:www\.)?twitter\.com/([a-zA-Z0-9_]+)""")
        @get:Length(max = 127)
        @Column(name = "contact_social_twitter")
        var socialTwitter: String?,

        @get:JsonProperty("youtube")
        @get:URL(regexp = """^(?:https|http)://(?:[\w]+\.)?youtube\.com/(?:c/|channel/|user/)?([a-zA-Z0-9\-]+)""")
        @get:Length(max = 127)
        @Column(name = "contact_social_youtube")
        var socialYoutube: String?,

        @get:JsonProperty("linkedIn")
        @get:URL(regexp = """^https?://((www|\w\w)\.|)?linkedin\.com/(in|pub)/.+""")
        @get:Length(max = 127)
        @Column(name = "contact_social_linkedin")
        var socialLinkedIn: String?,

        @get:JsonProperty("telegram")
        @get:Length(max = 32)
        @Column(name = "contact_social_telegram")
        var socialTelegram: String?,

        @get:JsonProperty("geolocation")
        @get:Length(max = 500)
        @Column(name = "geolocation")
        var geolocation: String?
) {
    constructor() : this(null, null, null, null, null, null, null, null, null, null, null, null)
}