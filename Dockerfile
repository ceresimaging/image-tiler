FROM maurimiranda/node-mapnik-gdal:latest

# Workaround to PG client install problem <(ò_Ó)>
RUN mkdir -p /usr/share/man/man1 /usr/share/man/man7

# Install dependencies
RUN apt install -y gnupg2 wget lsb-release
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" | tee  /etc/apt/sources.list.d/pgdg.list
RUN apt update -y && apt install -y postgresql-client-12

# Install Node packages
WORKDIR /srv/tiler

COPY package.json package-lock.json ./

RUN npm install && npm link /src/node-mapnik

# Copy code
COPY . .
COPY render/render /usr/local/bin

# Run server
CMD [ "npm", "run", "start" ]
