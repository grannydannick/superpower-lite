# 🌐 Deployment

## Staging Deployment

To deploy to staging environment:

1. Build the docker image and push it to ECR

```bash
make build/docker/app/stg
```

3. Deploy the app to EKS

```bash
make deploy/app/stg
```

Access the application at https://api.superpower-staging.com

## Feature Branch Deployment

Feature branch deployments allow you to deploy your feature branches to isolated environments with unique URLs. Each feature environment gets its own namespace and resources.

### Quick Start

#### 1. Create and Switch to Your Feature Branch

```bash
# Create a new feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Or switch to an existing feature branch
git checkout feature/your-feature-name
```

#### 2. Deploy Your Feature Branch

```bash
# Build and deploy your current branch
make build/docker/app/feature
make deploy/app/feature
```

The deployment will show:
- 🚀 Deployment status
- 🔗 App URL: `https://app-<feature-name>.superpower-staging.com`
- ⏱️ Expected deployment time (~2 minutes)

#### 3. Clean Up When Done

```bash
# Remove your feature app environment
make cleanup/app/feature
```

### Feature Name Generation

The feature name is automatically derived from your **current git branch**:

```bash
# Original branch → Feature name
feature/user-dashboard → feature-user-dashboard
bugfix/API_Error_Handling → bugfix-api-error-handling
my_awesome_feature → my-awesome-feature
```

**Rules:**
- All non-alphanumeric characters become dashes (`-`)
- Uppercase letters become lowercase
- Must be valid DNS name

### Environment Details

#### Resources
- **CPU**: 0.25 cores (request), 0.5 cores (limit)
- **Memory**: 256Mi (request), 512Mi (limit)
- **Replicas**: 1

#### Environment Variables
- `FEATURE_NAME`: Automatically set to your feature name
- `VITE_APP_API_URL`: Points to `https://api-<feature-name>.superpower-staging.com`


**2. DNS Not Resolving**
- Wait 2-3 minutes for DNS propagation
- Check if ingress has been created: `kubectl get ingress -n superpower-feature-<feature-name>`

**3. Application Issues**
```bash
# Check pod status
kubectl get pods -n superpower-feature-<feature-name>

# View logs
kubectl logs -n superpower-feature-<feature-name> deployment/superpower-app

# Check ingress configuration
kubectl describe ingress -n superpower-feature-<feature-name>
```


