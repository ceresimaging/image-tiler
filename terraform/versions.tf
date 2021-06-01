terraform {
  required_version = "~> 0.14"
  required_providers {
    aws = {
      version = "~> 3.39.0"
      source  = "hashicorp/aws"
    }
  }
}
