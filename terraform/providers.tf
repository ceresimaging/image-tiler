terraform {
  backend "s3" {
    bucket = "ceresimaging-terraform-state"
    key    = "image-tiler/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "aws" {
  region = "us-west-2"
}
