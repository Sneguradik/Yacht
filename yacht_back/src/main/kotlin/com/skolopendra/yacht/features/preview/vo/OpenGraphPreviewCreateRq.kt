package com.skolopendra.yacht.features.preview.vo

import com.skolopendra.yacht.features.preview.entities.PreviewSiteType
import org.springframework.web.multipart.MultipartFile

data class OpenGraphPreviewCreateRq(
        var title: String?,
        var siteName: String?,
        var url: String?,
        var description: String?,
        var type: PreviewSiteType?,
        var card: String?
)