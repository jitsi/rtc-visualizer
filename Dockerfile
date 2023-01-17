FROM node:16.4.2-alpine

RUN apk add --no-cache git && \
  rm -rf /var/lib/apt/lists/* /var/cache/apk /usr/share/man /tmp/*


ENV DIR=rtc-visualizer
ENV USER=rtcuser

WORKDIR /$DIR

RUN adduser --disabled-password $USER
RUN chown -R $USER:$USER /$DIR

USER $USER

# Use cached node_modules in case package.json doesn't change.
COPY --chown=$USER:$USER package.json package-lock.json /$DIR/

RUN npm install

COPY --chown=$USER:$USER . /$DIR

RUN npm run build-client

# This will run in k8s context so we use the heartbeat from there.
# HEALTHCHECK --interval=10s --timeout=10s --start-period=10s \
#   CMD curl --silent --fail http://localhost:3000/healthcheck \
#   || exit 1

EXPOSE 8087

ENTRYPOINT [ "npm", "run"]

CMD [ "start-server" ]
