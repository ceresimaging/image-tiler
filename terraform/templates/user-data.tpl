#cloud-config
write_files:
  - path: /etc/newrelic-infra.yml
    owner: root:root
    permissions: '0644'
    content: "license_key: ${newrelic_license_key}"
  - path: /root/.docker/config.json
    owner: root:root
    permissions: '0644'
    content: |
        {
            "credsStore": "ecr-login"
        }
  - path: /etc/systemd/system/tile-server.service
    owner: root:root
    permissions: '0644'
    content: ${tile_server_unit}
    encoding: b64
  - path: /root/tile-server.env
    owner: root:root
    permissions: '0644'
    content: ${app_config}
    encoding: b64
repo_update: true
repo_upgrade: all
yum_repos:
  newrelic:
    name: New Relic repository
    enabled: true
    baseurl: https://download.newrelic.com/infrastructure_agent/linux/yum/el/7/x86_64
    gpgcheck: true
    gpgkey: https://download.newrelic.com/infrastructure_agent/gpg/newrelic-infra.gpg
packages:
  - amazon-ecr-credential-helper
  - newrelic-infra
runcmd:
  - amazon-linux-extras install -y docker
  - service docker start
  - docker pull gliderlabs/logspout
  - docker run -d --name logspout -e SYSLOG_TAG="{{.ContainerName}}-${environment}" --volume=/var/run/docker.sock:/var/run/docker.sock gliderlabs/logspout ${papertrail_endpoint}
  - docker pull 292290781350.dkr.ecr.us-west-2.amazonaws.com/tile-server:production
  - systemctl enable tile-server
  - systemctl start tile-server

