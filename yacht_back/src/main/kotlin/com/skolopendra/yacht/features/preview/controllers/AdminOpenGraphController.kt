package com.skolopendra.yacht.features.preview.controllers

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.features.preview.services.OpenGraphService
import com.skolopendra.yacht.features.preview.vo.OpenGraphPreviewCreateRq
import com.skolopendra.yacht.features.preview.vo.OpenGraphPreviewUpdateRq
import com.skolopendra.yacht.features.preview.vo.OpenGraphPreviewVO
import org.springframework.security.access.annotation.Secured
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import javax.validation.Valid

@Validated
@RestController
@RequestMapping("administration/preview")
class AdminOpenGraphController(
    private val service: OpenGraphService
) {

    data class OpenGraphImageUrlResponse(
            var url: String? = null
    )

    @Secured(Roles.SUPERUSER)
    @PutMapping("url/{url}/cover")
    fun putCover(@PathVariable url: String, @RequestParam("file", required = false) file: MultipartFile?): OpenGraphImageUrlResponse {
        return OpenGraphImageUrlResponse(url = service.updateCover(url, file))
    }

    @Secured(Roles.SUPERUSER)
    @PutMapping("url/{url}/content")
    fun putContent(@PathVariable url: String, @Valid @RequestBody openGraphPreview: OpenGraphPreviewUpdateRq): OpenGraphPreviewVO {
        return service.updateContent(url, openGraphPreview)
    }

    @Secured(Roles.SUPERUSER)
    @PostMapping
    fun createOpenGraphPreview(@Valid @RequestBody openGraph: OpenGraphPreviewCreateRq, @RequestParam("file", required = false) file: MultipartFile?): OpenGraphPreviewVO {
        return service.createOpenGraph(openGraph, file)
    }

    @Secured(Roles.SUPERUSER)
    @DeleteMapping("{id}")
    fun deleteOpenGraphPreview(@PathVariable id: Long) {
        service.deleteOpenGraphById(id)
    }

    @GetMapping("get/id/{id}")
    fun getOpenGraphPreviewById(@PathVariable id: Long): OpenGraphPreviewVO {
        return service.getByIdOrThrow(id)
    }

    @GetMapping("get/url/{url}")
    fun getOpenGraphByUrl(@PathVariable url: String): OpenGraphPreviewVO {
        return service.getByUrlOrThrow(url)
    }
}