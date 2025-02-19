package com.skolopendra.yacht

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.jooq.SQLDialect
import org.jooq.impl.DataSourceConnectionProvider
import org.jooq.impl.DefaultConfiguration
import org.jooq.impl.DefaultDSLContext
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.data.repository.CrudRepository
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.jdbc.datasource.TransactionAwareDataSourceProxy
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.springframework.orm.jpa.JpaTransactionManager
import org.springframework.security.authentication.AuthenticationTrustResolver
import org.springframework.security.authentication.AuthenticationTrustResolverImpl
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.annotation.EnableTransactionManagement
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean
import javax.persistence.EntityManager
import javax.persistence.EntityManagerFactory
import javax.sql.DataSource

inline fun <reified T, ID> EntityManager.getReference(id: ID): T {
    return this.getReference(T::class.java, id)
}

inline fun <reified T, reified I> CrudRepository<T, I>.assertedFind(id: I): T {
    return findById(id).orElseThrow { NoSuchElementException("No ${T::class.simpleName} with id $id") }
}

@SpringBootApplication(scanBasePackages = ["com.skolopendra.*"])
@ConfigurationPropertiesScan(basePackages = ["com.skolopendra.*"])
@EnableTransactionManagement
class YachtApplication {
    @Bean
    fun transactionManager(entityManagerFactory: EntityManagerFactory): PlatformTransactionManager {
        return JpaTransactionManager(entityManagerFactory)
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun authenticationTrustResolver(): AuthenticationTrustResolver {
        return AuthenticationTrustResolverImpl()
    }

    @Bean
    fun validator(): LocalValidatorFactoryBean {
        return LocalValidatorFactoryBean()
    }

    @Bean
    fun dsl(conf: DefaultConfiguration): DefaultDSLContext {
        return DefaultDSLContext(conf)
    }

    @Bean
    fun connectionProvider(dataSource: DataSource): DataSourceConnectionProvider {
        return DataSourceConnectionProvider(TransactionAwareDataSourceProxy(dataSource))
    }

    @Bean
    fun jooqConfiguration(connectionProvider: DataSourceConnectionProvider): DefaultConfiguration {
        val conf = DefaultConfiguration()
        conf.set(connectionProvider)
        conf.set(SQLDialect.POSTGRES)
        return conf
    }

    @Bean
    fun objectMapper(builder: Jackson2ObjectMapperBuilder): ObjectMapper {
        val mapper = builder.build<ObjectMapper>()
        mapper.registerModule(KotlinModule())
        mapper.registerModule(JavaTimeModule())
        mapper.enable(SerializationFeature.WRITE_DATE_TIMESTAMPS_AS_NANOSECONDS)
        return mapper
    }
}

fun main(args: Array<String>) {
    runApplication<YachtApplication>(*args)
}
