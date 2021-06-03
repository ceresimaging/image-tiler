variable "environment" {
  type        = string
  description = "Ceres environment to deploy to"
}

variable "name" {
  type        = string
  description = "Unique deployment name, defaults to environment"
  default     = null
}

variable "vpc_id" {
  type        = string
  description = "AWS VPC ID"
  default     = null
}

variable "image_repo" {
  type        = string
  description = "Container repository for tile-server"
}

variable "image_tag" {
  type        = string
  description = "Image tag to deploy on instances"
  default     = "latest"
}

variable "app_config" {
  type        = map(any)
  description = "Key/Value map of environment variables to set on tile-server containers"
  default     = {}
}

variable "desired_instances" {
  type        = number
  description = "Number of tile-server instances to run"
  default     = 2
}
