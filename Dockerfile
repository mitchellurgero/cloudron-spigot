FROM cloudron/base:0.3.0
MAINTAINER Johannes Zellner <johannes@nebulon.de>

ENV DEBIAN_FRONTEND noninteractive

RUN mkdir -p /app/code
WORKDIR /app/code

RUN curl -L https://s3.amazonaws.com/Minecraft.Download/versions/1.8.4/minecraft_server.1.8.4.jar -o minecraft_server.jar

EXPOSE 3000 25565

ADD eula.txt /app/code/eula.txt
ADD index.js /app/code/index.js
ADD index.html /app/code/index.html
ADD package.json /app/code/package.json

RUN npm install

CMD [ "node", "index.js" ]
