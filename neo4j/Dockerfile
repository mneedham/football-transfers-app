FROM neo4j:3.5.8

ENV NEO4J_AUTH=neo4j/letmein

ENV APOC_VERSION 3.5.0.4
ENV APOC_URI https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/${APOC_VERSION}/apoc-${APOC_VERSION}-all.jar
RUN curl -L ${APOC_URI} -o /var/lib/neo4j/plugins/apoc-${APOC_VERSION}-all.jar

ENV GRAPHQL_VERSION 3.5.0.4
ENV GRAPHQL_URI https://github.com/neo4j-graphql/neo4j-graphql/releases/download/${GRAPHQL_VERSION}/neo4j-graphql-${GRAPHQL_VERSION}.jar
RUN curl -L ${GRAPHQL_URI} -o /var/lib/neo4j/plugins/neo4j-graphql-${GRAPHQL_VERSION}.jar

EXPOSE 7474 7473 7687

CMD ["neo4j"]