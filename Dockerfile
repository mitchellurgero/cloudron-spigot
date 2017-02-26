FROM cloudron/base:0.10.0
MAINTAINER Johannes Zellner <johannes@nebulon.de>

RUN mkdir -p /app/code
WORKDIR /app/code

ENV PATH /usr/local/node-4.7.3/bin:$PATH

RUN curl -L https://s3.amazonaws.com/Minecraft.Download/versions/1.11.2/minecraft_server.1.11.2.jar -o minecraft_server.jar

COPY eula.txt index.js index.html package.json start.sh /app/code/

RUN npm install

CMD [ "/app/code/start.sh" ]
