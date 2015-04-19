FROM girish/base:0.1.0
MAINTAINER Johannes Zellner <johannes@nebulon.de>

ENV DEBIAN_FRONTEND noninteractive

RUN mkdir -p /app/code
WORKDIR /app/code

RUN curl -L http://minecraft.net/download/minecraft_server.jar -o minecraft_server.jar

EXPOSE 3000 25565

CMD [ "node", "index.js" ]
