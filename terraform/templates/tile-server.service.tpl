[Unit]
Description=Tile Server
After=docker.service
Requires=docker.service

[Service]
Restart=always
ExecStartPre=-/usr/bin/docker stop %n
ExecStartPre=-/usr/bin/docker rm %n
ExecStart=/usr/bin/docker run --rm --name %n -p80:80 --env-file /root/tile-server.env --mount source=tiffs,target=/tiffs ${tile_server_image}

[Install]
WantedBy=multi-user.target
