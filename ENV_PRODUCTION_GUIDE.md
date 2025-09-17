# Hướng dẫn sử dụng .env.production

## Cách 1: Sử dụng docker-compose với file .env.production

### Bước 1: Tạo file .env.production
Tạo file `.env.production` trong thư mục gốc của project:

```env
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://root:12345678@mongodb:27017/sonthach_docker?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-production
JWT_EXPIRES_IN=7d
```

### Bước 2: Chạy với docker-compose
```bash
# Sử dụng file .env.production
docker-compose --env-file .env.production up -d

# Hoặc chỉ định rõ ràng
docker-compose -f docker-compose.yml --env-file .env.production up -d
```

## Cách 2: Sử dụng Docker trực tiếp với .env.production

### Bước 1: Build image
```bash
docker build -t sonthach-app .
```

### Bước 2: Chạy container với .env.production
```bash
docker run -d \
  --name sonthach-app \
  --env-file .env.production \
  -p 3000:3000 \
  sonthach-app
```

## Cách 3: Sử dụng docker-compose với file environment khác

### Tạo docker-compose.prod.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: sonthach-mongodb-prod
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: 12345678@Abc
      MONGO_INITDB_DATABASE: sonthach_prod
    volumes:
      - mongodb_data_prod:/data/db
    networks:
      - sonthach-network-prod

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: sonthach-app-prod
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:${PORT:-3000}"
    environment:
      NODE_ENV: production
      PORT: ${PORT:-3000}
      MONGODB_URI: ${MONGODB_URI:-mongodb://root:12345678@mongodb:27017/sonthach_prod?authSource=root}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
    depends_on:
      - mongodb
    networks:
      - sonthach-network-prod
    env_file:
      - .env.production

volumes:
  mongodb_data_prod:

networks:
  sonthach-network-prod:
    driver: bridge
```

### Chạy với file production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Cách 4: Override environment variables

### Chạy với override
```bash
# Override một số biến từ .env.production
docker-compose --env-file .env.production up -d -e PORT=8080

# Hoặc override trực tiếp
docker-compose up -d -e PORT=8080 -e JWT_SECRET=new-secret
```

## Kiểm tra environment variables

### Xem environment variables trong container
```bash
# Xem tất cả environment variables
docker exec sonthach-app env

# Xem một biến cụ thể
docker exec sonthach-app printenv MONGODB_URI
```

## Lưu ý bảo mật

1. **Không commit file .env.production** vào Git
2. **Sử dụng mật khẩu mạnh** cho JWT_SECRET
3. **Thay đổi mật khẩu MongoDB** mặc định
4. **Sử dụng Docker secrets** trong production thực tế

## Troubleshooting

### Nếu container không start
```bash
# Xem logs
docker-compose logs app

# Xem logs MongoDB
docker-compose logs mongodb
```

### Nếu không kết nối được MongoDB
```bash
# Kiểm tra MongoDB container
docker-compose ps

# Kiểm tra network
docker network ls
```

### Reset và chạy lại
```bash
# Dừng và xóa containers
docker-compose down

# Xóa volumes (cẩn thận - sẽ mất data)
docker-compose down -v

# Chạy lại
docker-compose --env-file .env.production up -d
```

## Kết nối MongoDB Compass

### Connection String cho MongoDB Compass:
```
mongodb://root:12345678@localhost:27017/sonthach_docker?authSource=root
```

**⚠️ Lưu ý:** Sử dụng `localhost` thay vì `mongodb` để kết nối từ bên ngoài Docker!

### Thông tin kết nối:
- **Hostname:** `localhost`
- **Port:** `27017`
- **Username:** `root`
- **Password:** `12345678`
- **Authentication Database:** `root`
- **Default Database:** `sonthach_docker`

### Kiểm tra kết nối:
```bash
# Kiểm tra container MongoDB
docker ps | grep mongodb

# Test kết nối
mongosh "mongodb://root:12345678@localhost:27017/sonthach_docker?authSource=root"
```

### Cho Production (sonthach_prod):
```
mongodb://root:12345678@localhost:27017/sonthach_prod?authSource=root
```
