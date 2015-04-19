FROM girish/base:0.1.0
MAINTAINER Johannes Zellner <johannes@nebulon.de>

ENV DEBIAN_FRONTEND noninteractive

RUN mkdir -p /app/code
WORKDIR /app/code

#RUN npm install -g serv
RUN curl -L http://minecraft.net/download/minecraft_server.jar -o minecraft_server.jar

EXPOSE 25565

CMD [ "java", "-Xmx1024M", "-Xms1024M", "-jar", "minecraft_server.jar", "nogui"]

