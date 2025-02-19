package com.skolopendra.yacht.features.preview.vo

import com.skolopendra.yacht.features.preview.entities.OpenGraphPreview
import com.skolopendra.yacht.features.preview.entities.PreviewSiteType
import java.sql.Timestamp

data class OpenGraphPreviewVO(
        val id: Long? = null,
        var title: String? = null,
        var siteName: String? = null,
        var url: String? = null,
        var image: String? = null,
        var description: String? = null,
        var type: PreviewSiteType = PreviewSiteType.WEBSITE,
        var card: String? = null,
        var updatedAt: Timestamp = Timestamp(0)
) {
    companion object {
        fun fromData(openGraphPreview: OpenGraphPreview): OpenGraphPreviewVO =
                OpenGraphPreviewVO(
                        openGraphPreview.id,
                        openGraphPreview.title,
                        openGraphPreview.siteName,
                        openGraphPreview.url,
                        openGraphPreview.image,
                        openGraphPreview.description,
                        openGraphPreview.type,
                        openGraphPreview.card,
                        openGraphPreview.updatedAt
                )
    }
}