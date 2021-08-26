FROM node:15.14.0@sha256:608bba799613b1ebf754034ae008849ba51e88b23271412427b76d60ae0d0627

COPY package.json yarn.lock /home/node/app/
WORKDIR /home/node/app
RUN yarn

COPY ./scripts/* /home/node/app/scripts/
RUN ./scripts/generate-key-pair-for-dev.sh

COPY . /home/node/app
RUN yarn build

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}
ARG PORT=3000
ENV PORT ${PORT}

EXPOSE $PORT

CMD ["yarn", "start"]
