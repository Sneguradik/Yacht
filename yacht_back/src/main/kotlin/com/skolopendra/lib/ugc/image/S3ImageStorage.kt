package com.skolopendra.lib.ugc.image

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.CannedAccessControlList
import com.amazonaws.services.s3.model.ObjectMetadata
import com.amazonaws.services.s3.model.PutObjectRequest
import com.skolopendra.lib.ugc.AmazonConfiguration
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.io.File
import java.net.URL
import java.util.*
import java.util.regex.Pattern

@Component
class S3ImageStorage : ImageStorage {
    @Autowired
    lateinit var amazonConfiguration: AmazonConfiguration

    @Autowired
    lateinit var client: AmazonS3

    override fun uploadImage(image: File, extension: String): String {
        // val processedImage = processImage(image)
        val uuid = UUID.randomUUID().toString().replace("-", "") + ".${extension}"
        val key = "ugc/${uuid}"
        val request = PutObjectRequest(amazonConfiguration.s3.bucket, key, image)
        request.metadata = ObjectMetadata().apply {
            cacheControl = "max-age=31536000"
            contentType = "image/${extension}"
        }
        request.cannedAcl = CannedAccessControlList.PublicRead
        client.putObject(request)
        return "https://${amazonConfiguration.s3.bucket}.hb.vkcs.cloud/${key}"
    }

    val imageObjectPattern = Pattern.compile("^/ugc/(\\w{32})$")!!

    override fun isOwnUrl(url: String): Boolean {
        val urlObject = URL(url)
        if (urlObject.host == "${amazonConfiguration.s3.bucket}.hb.vkcs.cloud") {
            return imageObjectPattern.matcher(urlObject.path).matches()
        }
        return false
    }
}
