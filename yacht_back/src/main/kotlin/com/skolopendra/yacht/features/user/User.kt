package com.skolopendra.yacht.features.user

import com.fasterxml.jackson.annotation.JsonProperty
import com.skolopendra.lib.Patchable
import com.skolopendra.yacht.entity.join.UserRole
import com.skolopendra.yacht.features.article.comment.Comment
import com.skolopendra.yacht.features.auth.Credentials
import com.skolopendra.yacht.features.auth.RefreshToken
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import org.hibernate.validator.constraints.Length
import java.sql.Timestamp
import javax.persistence.*
import javax.validation.constraints.Size

@Table(name = "\"user\"")
@Entity
class User(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @property:Patchable
        var firstName: String,

        @property:Patchable
        var lastName: String,

        @Basic(optional = true)
        var profilePictureUrl: String? = null,

        @Column(nullable = true)
        var profileCoverUrl: String? = null,

        @Column(unique = true, nullable = true)
        var username: String? = null,

        @Column(unique = true, nullable = true)
        var email: String? = null,

        @property:Patchable
        @get:Length(max = 215)
        @get:Size(max = 215)
        @Column(name = "bio", columnDefinition = "TEXT")
        var bio: String? = null,

        @property:Patchable
        @get:JsonProperty("contact")
        @Embedded
        var contactInfo: UserContactInfo? = null,

        @property:Patchable
        @get:JsonProperty("fullDescription")
        var descriptionFull: String = "",

        @property:Patchable
        @get:JsonProperty("company")
        var company: UserCompanyInfo = UserCompanyInfo(),

        var isBanned: Boolean = false,

        @JoinColumn(name = "master_account", insertable = false, updatable = false)
        @ManyToOne(fetch = FetchType.LAZY)
        var masterAccount: User? = null,

        @Column(name = "master_account")
        var masterAccountId: Long? = null,

        @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, orphanRemoval = true, cascade = [CascadeType.ALL])
        var roles: MutableSet<UserRole> = mutableSetOf(),

        @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, orphanRemoval = true, cascade = [CascadeType.ALL])
        var credentials: MutableSet<Credentials> = mutableSetOf(),

        @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, orphanRemoval = true, cascade = [CascadeType.ALL])
        var refreshToken: RefreshToken? = null,

        var isPinned: Boolean = false,

        @Column(name = "is_deleted")
        var isDeleted: Boolean = false,

        @Column(name = "last_login")
        var lastLogin: Timestamp = Timestamp(0)
)
