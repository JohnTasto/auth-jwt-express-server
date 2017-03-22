FROM node:7-alpine
EXPOSE 9090
ADD . /code/
WORKDIR /code
RUN npm install --quiet
ENV NODE_ENV production
ENTRYPOINT [ "npm", "start" ]
