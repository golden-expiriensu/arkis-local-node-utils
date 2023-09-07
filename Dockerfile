# default base image, but could be overwrited by --build-arg BASE_IMAGE=<anything you want>
ARG BASE_IMAGE=node:16.17.0
FROM $BASE_IMAGE

WORKDIR /app

RUN npm install -g pnpm@7

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . ./

RUN ["chmod", "+x", "./run_server.sh"]

EXPOSE 3000

ENTRYPOINT ["./run_server.sh"]