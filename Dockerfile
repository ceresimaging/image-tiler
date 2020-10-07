FROM maurimiranda/node-mapnik-gdal:latest

# Workaround to PG client install problem <(ò_Ó)>
RUN mkdir -p /usr/share/man/man1 /usr/share/man/man7

# Install dependencies
RUN apt update -y && apt install -y postgresql-client

# Install Node packages
WORKDIR /srv/tiler

COPY package.json package-lock.json ./

RUN npm install && npm link /src/node-mapnik

# Copy code
COPY . .

# Run server
CMD [ "npm", "run", "start" ]
