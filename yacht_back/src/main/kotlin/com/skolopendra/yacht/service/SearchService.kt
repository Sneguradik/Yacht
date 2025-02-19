package com.skolopendra.yacht.service

import com.skolopendra.yacht.jooq.Tables
import org.jooq.DataType
import org.jooq.Field
import org.jooq.SelectQuery
import org.jooq.impl.DSL
import org.jooq.impl.DefaultDataType
import org.springframework.stereotype.Service

@Service
class SearchService {
    companion object {
        const val WEBSEARCH_TO_TSQUERY = "websearch_to_tsquery"
        const val FTS_QUERY = "fts_query"
        const val TS_RANK = "ts_rank"
        const val TO_TSVECTOR = "to_tsvector"
        const val TO_TSQUERY = "to_tsquery"
        const val CONFIG = "russian"

        val REGCONFIG: DataType<Any> = DefaultDataType.getDefaultDataType("regconfig")
        val TSQUERY: DataType<Any> = DefaultDataType.getDefaultDataType("tsquery")
        val TSVECTOR: DataType<Any> = DefaultDataType.getDefaultDataType("tsvector")
        val TEXT: DataType<Any> = DefaultDataType.getDefaultDataType("text")
        val FLOAT4: DataType<Any> = DefaultDataType.getDefaultDataType("float4")

        val PARTIAL_PATTERN = Regex("""^[а-яa-z0-9]+$""", RegexOption.IGNORE_CASE)
        val SPLIT_PATTERN = Regex("""[^а-яa-z0-9]""", RegexOption.IGNORE_CASE)
    }

    private fun makeSplitWordQuery(textQuery: String): String {
        return textQuery.split(SPLIT_PATTERN).filter { it.isNotEmpty() }.joinToString(" | ") { "$it:*" }
    }

    private fun webSearchToQuery(textQuery: String): Field<*> {
        return DSL.field("coalesce({0} || {1})", DSL.function(
                WEBSEARCH_TO_TSQUERY,
                TSQUERY,
                DSL.value<String>(CONFIG).cast(REGCONFIG), DSL.value<String>(textQuery).cast(TEXT)
        ), DSL.function(
                TO_TSQUERY,
                TSQUERY,
                DSL.value<String>(CONFIG).cast(REGCONFIG), DSL.value<String>(makeSplitWordQuery(textQuery)).cast(TEXT)
        ))
    }

    private fun applySearchQuery(query: SelectQuery<*>, textQuery: String, vector: Field<*>) {
        val searchQuery = DSL.table("{0}", webSearchToQuery(textQuery)).`as`(FTS_QUERY)
        query.addJoin(searchQuery)
        query.addConditions(DSL.condition("{0} @@ {1}", vector, searchQuery))
        query.addOrderBy(DSL.function(TS_RANK, FLOAT4, vector, DSL.field(FTS_QUERY)).desc())
    }

    fun articleSearchQuery(query: SelectQuery<*>, textQuery: String) {
        applySearchQuery(query, textQuery, DSL.function(
                "article_ts_vector",
                TSVECTOR,
                Tables.ARTICLE.TITLE, Tables.ARTICLE.SUMMARY, Tables.ARTICLE.RENDERED_TEXT_ONLY
        ))
    }

    fun advertisementSearchQuery(query: SelectQuery<*>, textQuery: String) {
        applySearchQuery(query, textQuery, DSL.function(
                "advertisement_ts_vector",
                TSVECTOR,
                Tables.ADVERTISEMENT.NAME, Tables.ADVERTISEMENT.TEXT, Tables.ADVERTISEMENT.URL
        ))
    }

    fun userSearchQuery(query: SelectQuery<*>, textQuery: String) {
        applySearchQuery(query, textQuery, DSL.function(
                "user_ts_vector",
                TSVECTOR,
                Tables.USER.FIRST_NAME, Tables.USER.LAST_NAME, Tables.USER.USERNAME, Tables.USER.BIO
        ))
    }

    fun companySearchQuery(query: SelectQuery<*>, textQuery: String) {
        applySearchQuery(query, textQuery, DSL.function(
                "company_ts_vector",
                TSVECTOR,
                Tables.USER.COMPANY_NAME, Tables.USER.BIO
        ))
    }

    fun topicSearchQuery(query: SelectQuery<*>, textQuery: String) {
        applySearchQuery(query, textQuery, DSL.function(
                "topic_ts_vector",
                TSVECTOR,
                Tables.TOPIC.NAME, Tables.TOPIC.DESCRIPTION, Tables.TOPIC.DESCRIPTION_FULL
        ))
    }

    fun tagSearchQuery(query: SelectQuery<*>, textQuery: String) {
        applySearchQuery(query, textQuery, DSL.function(
                TO_TSVECTOR,
                TSVECTOR,
                DSL.value(CONFIG).cast(REGCONFIG), Tables.TAG.CONTENT.cast(TEXT)
        ))
    }
}