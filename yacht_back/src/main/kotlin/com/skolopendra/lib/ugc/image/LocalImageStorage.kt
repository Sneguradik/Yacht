package com.skolopendra.lib.ugc.image

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*

@Component
class LocalImageStorage : ImageStorage {
    @Autowired
    lateinit var configuration: LocalImageStorageConfiguration

    override fun uploadImage(image: File, extension: String): String {
        val name = UUID.randomUUID().toString().replace("-", "") + ".${extension}"
        Files.copy(image.toPath(), Paths.get(configuration.filesystemPath, name))
        return configuration.urlPrefix + name
    }

    override fun isOwnUrl(url: String): Boolean {
        return url.startsWith(configuration.urlPrefix)
    }
}
