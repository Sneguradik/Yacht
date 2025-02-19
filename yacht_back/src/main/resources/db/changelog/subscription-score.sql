--liquibase formatted sql

--changeset victoria:subscription-score splitStatements:false
CREATE FUNCTION "public"."subscription_score"("_user_id" bigint, "_article_id" bigint) RETURNS integer AS $$
DECLARE
    _good integer;
    _bad integer;
    _attributes bigint[];
    _attr_score boolean[];
    _auth_score boolean;
BEGIN
    _attributes := ARRAY(SELECT attribute_id FROM article_attribute WHERE article_id = _article_id);
    _attr_score := ARRAY(SELECT bad FROM attribute_subscription WHERE attribute_id = ANY(_attributes) AND user_id = _user_id);
    _auth_score := (SELECT bad FROM author_subscription LEFT JOIN article ON article.id = _article_id WHERE author_subscription.author_id = article.author_id AND author_subscription.user_id = _user_id);
    _good := (SELECT COUNT(*) FROM unnest(_attr_score) AS t(bad) WHERE bad = FALSE);
    _bad := (SELECT COUNT(*) FROM unnest(_attr_score) AS t(bad) WHERE bad = TRUE);
    _good := _good + (SELECT CASE _auth_score WHEN FALSE THEN 1 ELSE 0 END);
    _bad := _bad + (SELECT CASE _auth_score WHEN TRUE THEN 1 ELSE 0 END);
    RETURN _good - _bad * 1000;
END;
$$ LANGUAGE "plpgsql";