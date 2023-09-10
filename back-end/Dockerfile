# Base image
FROM openjdk:17-alpine

# Set the JAR file path in the build context
ARG JAR_FILE=/build/libs/*.jar

# ENV SERVER_PORT=8081
# ENV spring.mail.host=smtp.gmail.com
# ENV spring.mail.port=587
# ENV spring.mail.username=catchpalm@gmail.com
# ENV spring.mail.password=ucbdclhejwjynziy
# ENV spring.mail.properties.mail.smtp.auth=true
# ENV spring.mail.properties.mail.smtp.starttls.enable=true
# ENV spring.mail.properties.mail.smtp.starttls.required=true
# ENV server.address=i9c206.p.ssafy.io
# ENV server.servlet.contextPath=/
# ENV openvidu.url=http://i9c206.p.ssafy.io:4443/
# ENV openvidu.secret=MY_SECRET
# ENV google.client.id=991405470648-33raccrp5hr3mpedd2v0uq2uc8tbl4br.apps.googleusercontent.com
# ENV google.client.secret=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
# ENV google.redirect.uri=http://i9c206.p.ssafy.io:8081/login/oauth2/code/google
# ENV google.scope=profile,email

# Copy the JAR file from the build context to the container
COPY ${JAR_FILE} /app.jar

# Copy the modified application-aws.properties file to the container
#COPY src/main/resources/application-aws.properties /app/application.properties

# Expose port 8080 (if your application listens on this port)
EXPOSE 8080

# Set the entry point for the container to run the Spring Boot application
ENTRYPOINT ["java", "-jar","-Dspring.profiles.active=aws", "/app.jar"]
