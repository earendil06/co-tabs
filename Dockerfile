FROM clojure as build
WORKDIR /app
ADD . /app/
RUN lein do clean, uberjar

FROM java:8-alpine as deploy
WORKDIR /app
COPY --from=build /app/target/co-tabs-0.1.0-SNAPSHOT-standalone.jar .
ADD . /app/
CMD java -jar co-tabs-0.1.0-SNAPSHOT-standalone.jar
