FROM node:15.14.0-alpine

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}
ARG PORT=3000
ENV PORT ${PORT}

USER node
WORKDIR /home/node/app
COPY --chown=node:node . .
EXPOSE $PORT

CMD ["yarn", "start"]
