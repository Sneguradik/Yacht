package com.skolopendra.yacht.entity

import com.vladmihalcea.hibernate.type.array.ListArrayType
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "job_event_views")
@TypeDef(name = "list-array", typeClass = ListArrayType::class)
class JobAndEventViews(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @Enumerated
        var wherePlace: JobAndEventPlaces.JobAndEvent? = null,

        @Type(type = "list-array")
        @Column(
                name = "views_count",
                columnDefinition = "integer[]"
        )
        var viewsCount: List<Int> = listOf()
)
