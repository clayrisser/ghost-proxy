# Builds GhostProxy Docker Image
#################################################

FROM node:latest

MAINTAINER Jam Risser
EXPOSE 3008

COPY ./package.json /opt/app/package.json
WORKDIR /opt/app/
RUN npm install

COPY ./ /opt/app/

ENTRYPOINT node app.js
