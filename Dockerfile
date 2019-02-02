FROM cloudron/base:1.0.0

RUN mkdir -p /app/code
WORKDIR /app/code

RUN apt-get update && apt-get install -y openjdk-11-jre-headless

RUN curl -L https://launcher.mojang.com/v1/objects/3737db93722a9e39eeada7c27e7aca28b144ffa7/server.jar -o minecraft_server.jar

COPY frontend /app/code/frontend
COPY backend /app/code/backend
COPY eula.txt index.js package.json package-lock.json start.sh /app/code/

RUN npm install

CMD [ "/app/code/start.sh" ]
