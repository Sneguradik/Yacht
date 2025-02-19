package com.skolopendra.yacht.features.event

import com.skolopendra.lib.Patchable
import org.hibernate.validator.constraints.Length
import java.sql.Timestamp
import javax.persistence.Embeddable
import javax.persistence.EnumType
import javax.persistence.Enumerated

@Embeddable
@Patchable
class EventInfo(
        @get:Length(max = 128)
        var name: String = "",

        @get:Length(max = 64)
        var price: String? = null,

        @Enumerated(EnumType.ORDINAL)
        var currency: Event.Currency = Event.Currency.FREE,

        @get:Length(max = 64)
        var city: String? = null,

        @Enumerated(EnumType.ORDINAL)
        var type: Event.Type? = null,

        var date: Timestamp? = null,

        @get:Length(max = 100)
        var announcement: String = ""
)