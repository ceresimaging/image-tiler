# Tile Server infrastructure/deployment configuration

This stack manages basic infrastructure for running a deployment of the image-tiler (aka the "Tile Server"). This includes an AWS elastic load balancer, autoscaling group, launch configuration, and cloud-init user-data to automatically provision and run the tile-server container image and associated observability tools onto a new EC2 instance.

Tile Server EC2 instances are designed to be immutable and safe to terminate/restart. Each instance will pull a tile-server container image from ECR on startup, based on the environment label (aka `dev`, `demo`, `production`, etc.)

In the case of needing to SSH directly into a tile-server instance, AWS SSM should be used. Make sure your AWS IAM user has the appropriate permissions to use SSM.

## Usage

Set up the initial Terraform workspace, providers, modules, etc:

```
$ terraform init
```

Terraform workspaces are used to separate deployments in different environments.

```
$ terraform workspace list
* dev
  demo
  production
$ terraform workspace select production
Switched to workspace "production"
```

Configuration variables are stored in separate variable files per environment under `environments/`. Sensitive values are stored in AWS Secrets Manager under the `tile-server` namespace and automatically sourced in the Terraform config.

Be sure to use the correct `.tfvars` file for the environment you're deploying to:

```
$ terraform apply -var-file=environments/dev.tfvars
```

## CI

`Jenkinsfile` contains a Jenkins declarative pipeline can be used to deploy this stack via Jenkins CI. The pipeline will pull a specific Git branch of this repo, build and publish the container image, and then run terraform plan and/or apply. In the case of running Terraform apply, the launch configuration used by EC2 instances will be updated, and an instance-refresh will be run on the ASG, restarting all the EC2 instances and effectively re-deploying the latest container image from ECR by the chosen environment label.

## Requirements

| Name | Version |
|------|---------|
| terraform | ~> 0.14 |
| aws | ~> 3.39.0 |

## Providers

| Name | Version |
|------|---------|
| aws | ~> 3.39.0 |
| terraform | n/a |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| app\_config | Key/Value map of environment variables to set on tile-server containers | `map(any)` | `{}` | no |
| desired\_instances | Number of tile-server instances to run | `number` | `2` | no |
| environment | Ceres environment to deploy to | `string` | n/a | yes |
| image\_repo | Container repository for tile-server | `string` | n/a | yes |
| image\_tag | Image tag to deploy on instances | `string` | `"latest"` | no |
| name | Unique deployment name, defaults to environment | `string` | `null` | no |
| vpc\_id | AWS VPC ID | `string` | `null` | no |

## Outputs

| Name | Description |
|------|-------------|
| asg\_name | Name of AWS ASG managing tile-server instances |

