FROM cloudron/base:1.0.0

RUN mkdir -p /app/code
WORKDIR /app/code

RUN apt-get update && apt-get install -y git openjdk-11-jre-headless


## Download Spigot latest each build (always get the latest and greatest!)
RUN curl -L https://hub.spigotmc.org/jenkins/job/BuildTools/lastStableBuild/artifact/target/BuildTools.jar -o build_tool.jar

COPY frontend /app/code/frontend
COPY backend /app/code/backend
COPY index.js package.json package-lock.json start.sh /app/code/

RUN npm install

## Build spigot!
#RUN git config --global --unset core.autocrlf
RUN java -jar build_tool.jar

# Start server
CMD [ "/app/code/start.sh" ]
