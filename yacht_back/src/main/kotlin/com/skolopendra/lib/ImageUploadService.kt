package com.skolopendra.lib

import com.skolopendra.lib.ugc.image.ContentConfiguration
import com.skolopendra.lib.ugc.image.ImageStorage
import org.imgscalr.Scalr
import org.springframework.stereotype.Service
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO
import kotlin.math.min

@Service
class ImageUploadService(
        private val storage: ImageStorage,
        private val contentConfiguration: ContentConfiguration,
        private val allStorage: List<ImageStorage>
) {
    private fun processImage(rawImage: File): File {
        val bufferedImage = ImageIO.read(rawImage)
        require(!(bufferedImage.width > contentConfiguration.maxWidth ||
                bufferedImage.height > contentConfiguration.maxHeight)) { "Image too large" }
        // TODO Additional processing, if needed
        return rawImage
    }

    fun uploadImage(image: File, extension: String): String {
        return storage.uploadImage(image, extension)
    }

    fun uploadImage(image: BufferedImage): String {
        val extension = "png"
        val file = File.createTempFile("image", "png")
        try {
            ImageIO.write(image, "png", file)
            return uploadImage(file, extension)
        } finally {
            file.delete()
        }
    }

    fun wasUploadedToService(url: String): Boolean {
        for (st in allStorage) {
            if (st.isOwnUrl(url)) {
                return true
            }
        }
        return false
    }

    fun resizeWithCrop(width: Int, height: Int, image: BufferedImage): String {
        val resized = if (width > height)
            Scalr.resize(image, Scalr.Mode.FIT_TO_WIDTH, width, height)
        else
            Scalr.resize(image, Scalr.Mode.FIT_TO_HEIGHT, width, height)

        val result = Scalr.crop(resized, width, height)
        return uploadImage(result)
    }

    fun resizeToFixedSize(width: Int, height: Int, image: BufferedImage): String {
        val result = Scalr.resize(image, width, height)
        return uploadImage(result)
    }

    fun cropToCenterSquareAndUpload(size: Int, image: BufferedImage): String {
        val smallestSide = min(image.width, image.height)
        val cropped = Scalr.crop(image, (image.width - smallestSide) / 2, (image.height - smallestSide) / 2, smallestSide, smallestSide)
        val result = Scalr.resize(cropped, size)
        return uploadImage(result)
    }
}