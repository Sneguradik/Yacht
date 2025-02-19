package com.skolopendra.yacht.features.showcase

import com.skolopendra.lib.Patchable
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.validator.constraints.Length
import org.hibernate.validator.constraints.URL
import java.time.Duration
import javax.persistence.Column
import javax.persistence.Embeddable

@Patchable
@Embeddable
@TypeDef(name = "jsonb", typeClass = JsonBinaryType::class)
class ShowcaseStaticItemInfo(
        var duration: Duration? = null,

        @property:Patchable(false)
        var cover: String? = null,

        @get:Length(max = 64)
        var subtitle: String = "",

        @get:Length(max = 64)
        var title: String = "",

        @Type(type = "jsonb")
        @Column(name = "options")
        var options: Options? = null,

        @get:URL
        @get:Length(max = 256)
        var url: String? = null
) {
    @Patchable
    data class Options(
            var postCount: Int? = null,
            var subCount: Int? = null,
            var viewCount: Int? = null
    )

    fun ensureOptions(): Options {
        if (options == null)
            options = Options()
        return options!!
    }
}