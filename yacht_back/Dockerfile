FROM bellsoft/liberica-openjdk-alpine-musl:17

WORKDIR /app

ARG SERVICE_DIR
ENV SERVICE_DIR=${SERVICE_DIR}
COPY *.jar /app/main.jar

EXPOSE 8080

CMD echo "Starting backend" && \
    java ${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -jar /app/main.jar
