# Run localhost
- 1. Clone project
  ```git
    git clone ...
  ```

- 2. Init file .env
  Content .env example
  ```
    MONGODB_URI=...
    PORT=4300
    NODE_ENV=development
    JWT_SECRET=your-super-secret-jwt-key
    JWT_EXPIRES_IN=24h
    ```

- 3. Run project
  
  - Install node_modules
     ```bash
      npm i
    ```

  - Run develop:
    ```bash
    npm run dev
    ```

# Run docker
  ```bash
  docker-compose up -d
  ```