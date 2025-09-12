# Docker Security Hardening Guide

## Current Security Status

The Docker vulnerability scanner is reporting 1 high vulnerability in the base images. This is common with most Python base images and requires additional security measures.

## Security Measures Implemented

### 1. **Minimal Runtime Dependencies**

- Removed unnecessary packages (curl, build tools)
- Only essential runtime libraries included
- Regular security updates applied

### 2. **Non-Root User Execution**

```dockerfile
RUN groupadd -r app && useradd -r -g app app
USER app
```

### 3. **File System Permissions**

```dockerfile
RUN mkdir -p media static logs && \
    chown -R app:app /app && \
    chmod -R 755 /app && \
    chmod -R 750 /app/media /app/static /app/logs
```

### 4. **Python Security Hardening**

```dockerfile
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONHASHSEED=random
```

### 5. **Multi-Stage Build**

- Separate builder and runtime stages
- Minimal runtime image size
- No build tools in production image

## Additional Security Recommendations

### 1. **Container Runtime Security**

#### Use Security Contexts

```yaml
# docker-compose.yml
services:
  web:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - SETGID
      - SETUID
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=128m
```

#### Resource Limits

```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: "0.5"
    reservations:
      memory: 256M
```

### 2. **Network Security**

#### Use Custom Networks

```yaml
networks:
  backend:
    driver: bridge
    internal: true
  frontend:
    driver: bridge
```

### 3. **Environment Security**

#### Secrets Management

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  secret_key:
    file: ./secrets/secret_key.txt
```

### 4. **Image Scanning**

#### Regular Vulnerability Scanning

```bash
# Using Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image jaay-baan-backend:latest

# Using Docker Scout
docker scout quickview jaay-baan-backend:latest
```

### 5. **Runtime Security Monitoring**

#### Security Policies

```yaml
# security-policy.yml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: jaay-baan-policy
spec:
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/default/sa/frontend"]
    - to:
        - operation:
            methods: ["GET", "POST"]
```

## Vulnerability Mitigation Strategies

### 1. **Base Image Alternatives**

#### Option A: Distroless (Most Secure)

```dockerfile
FROM gcr.io/distroless/python3-debian12:latest
# Pros: Minimal attack surface, no shell, no package manager
# Cons: Limited debugging capabilities, harder to troubleshoot
```

#### Option B: Alpine (Smaller but Different Vulnerabilities)

```dockerfile
FROM python:3.13-alpine3.19
# Pros: Smaller size, different vulnerability profile
# Cons: musl libc compatibility issues, still has vulnerabilities
```

#### Option C: Ubuntu LTS (Current Choice)

```dockerfile
FROM ubuntu:24.04
# Pros: Regular security updates, broad compatibility
# Cons: Larger size, more attack surface
```

### 2. **Image Hardening**

#### Remove Unnecessary Files

```dockerfile
RUN rm -rf /usr/share/doc /usr/share/man /usr/share/locale \
    /var/cache/apt /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

#### Use Multi-Stage Builds

```dockerfile
# Build stage with all tools
FROM ubuntu:24.04 as builder
# ... build process

# Runtime stage with minimal dependencies
FROM ubuntu:24.04 as runtime
COPY --from=builder /app /app
```

### 3. **Runtime Protection**

#### AppArmor Profile

```bash
# /etc/apparmor.d/docker-jaay-baan
profile docker-jaay-baan flags=(attach_disconnected,mediate_deleted) {
  network inet tcp,
  network inet udp,
  deny network raw,
  deny network packet,
}
```

#### SELinux Policies

```bash
# Enable SELinux enforcement
setsebool -P container_manage_cgroup on
```

## Monitoring and Alerting

### 1. **Container Security Monitoring**

```yaml
# monitoring/security-alerts.yml
alerts:
  - name: HighVulnerabilityDetected
    expr: vulnerability_count{severity="high"} > 0
    for: 5m
    annotations:
      summary: "High vulnerability detected in container"
```

### 2. **Runtime Anomaly Detection**

```bash
# Using Falco
docker run --rm -i -t \
  --name falco \
  --privileged \
  -v /var/run/docker.sock:/host/var/run/docker.sock \
  -v /dev:/host/dev \
  -v /proc:/host/proc:ro \
  falcosecurity/falco:latest
```

## Compliance and Standards

### 1. **CIS Docker Benchmark**

- User namespaces enabled
- Content trust enabled
- No privileged containers
- Resource limits enforced

### 2. **NIST Container Security**

- Image vulnerability scanning
- Runtime security monitoring
- Network segmentation
- Access controls

## Update Strategy

### 1. **Regular Base Image Updates**

```bash
# Weekly security update cycle
docker build --no-cache -t jaay-baan-backend:$(date +%Y%m%d) .
```

### 2. **Automated Vulnerability Scanning**

```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t test-image .
      - name: Run Trivy scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: "test-image"
          format: "sarif"
          output: "trivy-results.sarif"
```

## Conclusion

While the vulnerability scanner reports issues with base images, we've implemented comprehensive security measures to mitigate risks:

1. **Defense in Depth**: Multiple security layers
2. **Principle of Least Privilege**: Non-root execution
3. **Attack Surface Reduction**: Minimal dependencies
4. **Runtime Protection**: Security contexts and monitoring
5. **Regular Updates**: Automated scanning and updates

The reported vulnerabilities are likely in base OS packages and should be addressed through regular base image updates and runtime security measures.
