FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source files (will be overridden by volume mount)
COPY src /app/src
COPY index.html /app/index.html
COPY *.ts /app/
COPY *.js /app/
COPY *.json /app/

# Expose Vite dev server port
EXPOSE 3000

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]