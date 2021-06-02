data "terraform_remote_state" "environment" {
  backend = "s3"
  config = {
    bucket = "ceresimaging-terraform-state"
    key    = "env:/${var.environment}/spoke_environment/terraform.tfstate"
    region = "us-west-2"
  }
}

locals {
  env         = data.terraform_remote_state.environment.outputs
  environment = terraform.workspace
  secrets     = jsondecode(data.aws_secretsmanager_secret_version.tile_server.secret_string)
  app_config  = merge(var.app_config, local.secrets)
}

resource "aws_elb" "tile_server" {
  name_prefix = "tiler-"
  internal    = false

  subnets = local.env.aws_public_subnets

  security_groups = [
    aws_security_group.load_balancer.id,
    aws_security_group.origin_communication.id
  ]

  listener {
    instance_port     = 80
    instance_protocol = "HTTP"
    lb_port           = 80
    lb_protocol       = "HTTP"
  }

  health_check {
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    target              = "TCP:80"
  }

  tags = {
    managed_by  = "terraform"
    environment = local.environment
    service     = "tile-server"
  }

}

data "aws_ssm_parameter" "amilinux2" {
  name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}

resource "aws_autoscaling_group" "tile_server" {
  name_prefix = "image-tiler-"

  launch_template {
    id      = aws_launch_template.tile_server.id
    version = "$Latest"
  }

  max_size         = 10
  min_size         = 1
  desired_capacity = var.desired_instances

  vpc_zone_identifier = local.env.aws_private_subnets

  load_balancers = [
    aws_elb.tile_server.name
  ]

  tags = [
    {
      key                 = "managed_by"
      value               = "terraform"
      propagate_at_launch = true
    },
    {
      key                 = "service"
      value               = "tile-server"
      propagate_at_launch = true
    },
    {
      key                 = "environment"
      value               = local.environment
      propagate_at_launch = true
    }
  ]

  health_check_type = "ELB"
  health_check_grace_period = 240

  instance_refresh {
    strategy = "Rolling"
  }

  lifecycle {
    ignore_changes = [
      desired_capacity
    ]
  }

}

resource "aws_launch_template" "tile_server" {
  name_prefix   = "image-tiler-"
  description   = "Image Template for Image Tiler instances"
  instance_type = "c5ad.large"
  image_id      = data.aws_ssm_parameter.amilinux2.value

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size = 250
    }
  }

  vpc_security_group_ids = [
    aws_security_group.origin_communication.id
  ]

  iam_instance_profile {
    name = aws_iam_instance_profile.instance.name
  }

  // hey dogg I heard u like templates in ur templates
  user_data = base64encode(templatefile("${path.module}/templates/user-data.tpl", {
    newrelic_license_key = local.secrets.NEW_RELIC_LICENSE_KEY
    environment          = local.environment
    papertrail_endpoint  = local.secrets.PAPERTRAIL_ENDPOINT
    tile_server_unit = base64encode(templatefile("${path.module}/templates/tile-server.service.tpl", {
      tile_server_image = "${var.image_repo}:${var.image_tag}"
    }))
    app_config = base64encode(templatefile("${path.module}/templates/env.tpl", {
      app_config = local.app_config
    }))
  }))

}

resource "aws_iam_instance_profile" "instance" {
  name_prefix = "image-tiler-"
  role        = aws_iam_role.instance_profile.name
}

resource "aws_iam_role" "instance_profile" {
  name_prefix = "image-tiler-"
  path        = "/"
  managed_policy_arns = [
    aws_iam_policy.ecr_access.arn,
    "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
    "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  ]

  assume_role_policy = data.aws_iam_policy_document.trust.json
}

data "aws_iam_policy_document" "ecr_access" {
  statement {
    actions = [
      "ecr:*"
    ]
    resources = [
      "*" # fix this
    ]
  }
}

resource "aws_iam_policy" "ecr_access" {
  name_prefix = "image-tiler-"
  policy      = data.aws_iam_policy_document.ecr_access.json
}

data "aws_iam_policy_document" "trust" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      type = "Service"
      identifiers = [
        "ec2.amazonaws.com"
      ]
    }
  }
}

# Look up our secrets out of Secrets Manager
data "aws_secretsmanager_secret" "tile_server" {
  name = "tile-server/${local.environment}/secrets"
}

data "aws_secretsmanager_secret_version" "tile_server" {
  secret_id = data.aws_secretsmanager_secret.tile_server.id
}
