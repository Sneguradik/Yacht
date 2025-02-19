package com.skolopendra.yacht.features.preview.vo

import com.skolopendra.yacht.features.preview.entities.PreviewSiteType
import java.sql.Timestamp

data class OpenGraphPreviewUpdateRq(
        var title: String?,
        var siteName: String?,
        var description: String?,
        var type: PreviewSiteType?,
        var card: String?
)