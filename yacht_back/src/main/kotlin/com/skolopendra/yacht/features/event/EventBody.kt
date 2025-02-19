package com.skolopendra.yacht.features.event

import com.skolopendra.lib.Patchable
import org.hibernate.validator.constraints.Length
import org.hibernate.validator.constraints.URL
import javax.persistence.Column
import javax.persistence.Embeddable

@Embeddable
class EventBody(
        @property:Patchable
        @get:Length(max = 512)
        var address: String = "",

        @property:Patchable
        @get:Length(max = 25600)
        @get:URL
        var registrationLink: String? = null,

        @get:Length(max = 25600)
        @Column(name = "body_source")
        var source: String? = null,

        @Column(name = "body_html")
        var html: String? = null
)
