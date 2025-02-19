package com.skolopendra.yacht.features.preview.services

import com.skolopendra.lib.ImageUploadService
import com.skolopendra.yacht.features.preview.entities.OpenGraphPreview
import com.skolopendra.yacht.features.preview.entities.PreviewSiteType
import com.skolopendra.yacht.features.preview.repositories.OpenGraphRepository
import com.skolopendra.yacht.features.preview.vo.OpenGraphPreviewCreateRq
import com.skolopendra.yacht.features.preview.vo.OpenGraphPreviewUpdateRq
import com.skolopendra.yacht.features.preview.vo.OpenGraphPreviewVO
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.sql.Timestamp
import java.time.Instant
import javax.imageio.ImageIO
import javax.persistence.EntityNotFoundException

@Service
class OpenGraphService(
        private val imageUploadService: ImageUploadService,
        private val repository: OpenGraphRepository
) {

    @Transactional
    fun updateCover(url: String, file: MultipartFile?): String {
        val openGraph = repository.findFirstByUrl(url) ?: throw EntityNotFoundException("OpenGraph by $url not found")

        val uploaded = if (file != null) {
            val image = ImageIO.read(file.inputStream)
            imageUploadService.uploadImage(image)
        } else {
            ""
        }

        repository.save(openGraph.apply {
                this.image = uploaded
                this.updatedAt = Timestamp.from(Instant.now())
        })

        return uploaded
    }

    @Transactional
    fun updateContent(url: String, content: OpenGraphPreviewUpdateRq): OpenGraphPreviewVO {
        val openGraph = repository.findFirstByUrl(url) ?: throw EntityNotFoundException("OpenGraph by $url not found")

        return OpenGraphPreviewVO.fromData(repository.save(openGraph.apply {
            title = content.title
            siteName = content.siteName
            this.url = url
            description = content.description
            type = content.type ?: PreviewSiteType.WEBSITE
            card = content.card
            this.updatedAt = Timestamp.from(Instant.now())
        }))
    }

    @Transactional
    fun createOpenGraph(content: OpenGraphPreviewCreateRq, file: MultipartFile?): OpenGraphPreviewVO {

        val uploaded = if (file != null) {
            val image = ImageIO.read(file.inputStream)
            imageUploadService.uploadImage(image)
        } else {
            ""
        }

        return OpenGraphPreviewVO.fromData(repository.save(OpenGraphPreview().apply {
            title = content.title
            siteName = content.siteName
            url = content.url
            description = content.description
            type = content.type ?: PreviewSiteType.WEBSITE
            card = content.card
            image = uploaded
            this.updatedAt = Timestamp.from(Instant.now())
        }))
    }

    fun deleteOpenGraphById(id: Long) {
        repository.deleteById(id)
    }

    fun getByIdOrThrow(id: Long): OpenGraphPreviewVO {
        return OpenGraphPreviewVO.fromData(repository.findByIdOrNull(id) ?: throw EntityNotFoundException("Open graph preview not found by $id"))
    }

    fun getByUrlOrThrow(url: String): OpenGraphPreviewVO {
        return OpenGraphPreviewVO.fromData(repository.findFirstByUrl(url) ?: throw EntityNotFoundException("Open graph preview not found by $url"))
    }
}