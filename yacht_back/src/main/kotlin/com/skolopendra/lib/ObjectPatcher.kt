package com.skolopendra.lib

import com.fasterxml.jackson.annotation.JsonProperty
import java.sql.Timestamp
import java.time.Duration
import java.time.Instant
import javax.validation.ConstraintViolationException
import javax.validation.Validator
import kotlin.reflect.KClass
import kotlin.reflect.KMutableProperty1
import kotlin.reflect.KProperty1
import kotlin.reflect.full.createInstance
import kotlin.reflect.full.findAnnotation
import kotlin.reflect.full.memberProperties
import kotlin.reflect.jvm.jvmErasure

class ObjectPatcher<T : Any>(
        val target: T,
        private val validator: Validator,
        private val targetClassJava: Class<T> = target.javaClass,
        private val targetClass: KClass<T> = targetClassJava.kotlin
) {
    private fun isPatchable(property: KProperty1<T, *>): Boolean {
        val propertyPatchableAnnotation = property.findAnnotation<Patchable>()
        val classPatchableAnnotation = targetClass.findAnnotation<Patchable>()

        if (propertyPatchableAnnotation != null)
            return propertyPatchableAnnotation.value

        if (classPatchableAnnotation != null)
            return classPatchableAnnotation.value

        return false
    }

    private fun nestedPatch(property: KMutableProperty1<T, *>, patch: Map<String, Any?>): Any {
        val cls = property.returnType.jvmErasure
        val target = property.get(target) ?: cls.createInstance()
        val patcher = ObjectPatcher(target, validator)
        patcher.apply(patch)
        return target
    }

    private fun getProperty(key: String): KMutableProperty1<T, *> {
        val property = targetClass.memberProperties.find {
            if (it.name == key) true
            else {
                val jsonProperty = it.getter.findAnnotation<JsonProperty>()
                if (jsonProperty == null) false
                else
                    jsonProperty.value == key
            }
        } ?: throw IllegalArgumentException("Missing property: $key")
        if (property !is KMutableProperty1<T, *>)
            throw IllegalArgumentException("Immutable property: $key")
        if (!isPatchable(property))
            throw IllegalArgumentException("Property is not patchable: $key")
        return property
    }

    fun apply(patch: Map<String, Any?>): T {
        for (kv in patch.entries) {
            val prop = getProperty(kv.key)
            val errors = validator.validateValue(targetClassJava, prop.name, kv.value)
            if (errors.isNotEmpty())
                throw ConstraintViolationException(errors)
            @Suppress("UNCHECKED_CAST")
            if (kv.value is Map<*, *>)
                prop.setter.call(target, nestedPatch(prop, kv.value as Map<String, *>))
            else
                prop.setter.call(target, convert(kv.value, prop.returnType.jvmErasure.java))
        }
        return target
    }

    fun convert(value: Any?, type: Class<*>): Any? {
        if (value == null)
            return value
        if (type.isAssignableFrom(value.javaClass))
            return value
        if (type.isEnum) {
            if (value is String) {
                for (field in type.declaredFields) {
                    if (field.isEnumConstant && field.name == value)
                        return field.get(null)
                }
            }
        }
        if (Duration::class.java.isAssignableFrom(type) && value is Number) {
            return Duration.ofMillis(value.toLong())
        }
        if (Timestamp::class.java.isAssignableFrom(type) && value is Number) {
            return Timestamp.from(Instant.ofEpochMilli(value.toLong()))
        }
        throw IllegalArgumentException("cannot convert type: $type, value: ${value} - ${value.javaClass.toGenericString()}")
    }
}