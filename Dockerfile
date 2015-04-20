FROM girish/base:0.1.0
MAINTAINER Johannes Zellner <johannes@nebulon.de>

ENV DEBIAN_FRONTEND noninteractive

RUN mkdir -p /app/code
WORKDIR /app/code

RUN curl -L https://s3.amazonaws.com/Minecraft.Download/versions/1.8.4/minecraft_server.1.8.4.jar -o minecraft_server.jar

EXPOSE 3000 25565

ADD eula.txt /app/code/eula.txt

CMD [ "node", "index.js" ]
