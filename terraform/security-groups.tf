resource "aws_security_group" "load_balancer" {
  name_prefix = "image-tiler-elb-"
  vpc_id      = local.env.aws_vpc_id

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = -1
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

}

resource "aws_security_group" "origin_communication" {
  name_prefix = "image-tiler-common-"
  vpc_id      = local.env.aws_vpc_id

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = -1
    self      = true
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = -1
    self      = true
  }

  egress {
    from_port = 0
    to_port   = 0
    cidr_blocks = [
      "0.0.0.0/0"
    ]
    protocol = -1

  }

}

