FROM maurimiranda/node-mapnik-gdal:latest

# Install Node packages
WORKDIR /srv/tiler

COPY package.json package-lock.json ./

RUN npm install && npm link /src/node-mapnik

# Copy code
COPY . .

# Run server
CMD [ "npm", "run", "start" ]
