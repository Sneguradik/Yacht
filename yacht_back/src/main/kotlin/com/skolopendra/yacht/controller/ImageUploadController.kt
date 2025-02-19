package com.skolopendra.yacht.controller

import com.skolopendra.lib.ImageUploadService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.io.File

// TODO: Deprecate this, upload article images directly into /article
@RestController
@RequestMapping("/upload")
class ImageUploadController(
    private val imageUploadService: ImageUploadService
) {
    data class ImageUploadResponse(
        val url: String
    )

    @PostMapping("image")
    fun image(@RequestParam("file") file: MultipartFile): ImageUploadResponse {
        require(!file.isEmpty)
        val temporaryFile = File.createTempFile("uploaded-image", "tmp")
        return try {
            file.transferTo(temporaryFile)
            val contentType = if (file.contentType !== null)
                file.contentType!!.split("/")[1]
            else
                "png"

            val url = imageUploadService.uploadImage(temporaryFile, contentType)
            ImageUploadResponse(url)
        } finally {
            temporaryFile.delete()
        }
    }
}
