FROM maurimiranda/node-mapnik-gdal:latest

RUN \
  cd /src/node-mapnik && \
  npm link

WORKDIR /srv/tiler

# Install Node packages
COPY package.json package-lock.json ./
RUN \
  npm install && \
  npm link mapnik


# Copy code
COPY . .

# Run server
CMD [ "npm", "run", "start" ]
