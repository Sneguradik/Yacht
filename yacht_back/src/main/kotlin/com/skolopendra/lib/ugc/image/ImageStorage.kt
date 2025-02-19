package com.skolopendra.lib.ugc.image

import java.io.File

interface ImageStorage {
    /**
     * Uploads an image
     * @return URL to uploaded image
     */
    fun uploadImage(image: File, extension: String): String

    /**
     * @return Does the URL belong to the storage
     */
    fun isOwnUrl(url: String): Boolean
}