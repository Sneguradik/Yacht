package com.skolopendra.yacht.configuration

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.DependsOn
import org.springframework.jmx.support.ConnectorServerFactoryBean
import org.springframework.remoting.rmi.RmiRegistryFactoryBean


@Configuration
class RMIConfig {

    @Value("\${jmx.rmi.host}")
    lateinit var rmiHost: String

    @Value("\${jmx.rmi.port}")
    lateinit var rmiPort: String

    @Bean
    fun rmiRegistry(): RmiRegistryFactoryBean {
        val rmiRegistryFactoryBean = RmiRegistryFactoryBean()
        rmiRegistryFactoryBean.port = rmiPort.toInt()
        rmiRegistryFactoryBean.setAlwaysCreate(true)
        return rmiRegistryFactoryBean
    }

    @Bean
    @DependsOn("rmiRegistry")
    @Throws(Exception::class)
    fun connectorServerFactoryBean(): ConnectorServerFactoryBean {
        val connectorServerFactoryBean = ConnectorServerFactoryBean()
        connectorServerFactoryBean.setObjectName("connector:name=rmi")
        connectorServerFactoryBean.setServiceUrl(String.format("service:jmx:rmi://%s:%s/jndi/rmi://%s:%s/jmxrmi", rmiHost, rmiPort.toInt(), rmiHost, rmiPort.toInt()))
        return connectorServerFactoryBean
    }
}