output "asg_name" {
  description = "Name of AWS ASG managing tile-server instances"
  value       = aws_autoscaling_group.tile_server.name
}
