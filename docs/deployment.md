# 🌐 Deployment

edit the .env file with any change you want to make

1. Build the docker image and push it to ECR

```bash
make build/docker/app/stg
```

2. Deploy the app to EKS

```bash
make deploy/app/stg
```

Access the application at https://halfbaked-app.superpower-staging.com
