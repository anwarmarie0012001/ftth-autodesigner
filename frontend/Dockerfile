# Gunakan base image Node.js yang ringan
FROM node:20-alpine

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Copy file package.json dan lock file
COPY package*.json ./

# Install semua dependencies
RUN npm install

# Copy semua sisa kode aplikasi
COPY . .

# Expose port yang digunakan oleh aplikasi Anda
EXPOSE 3000

# Perintah default untuk menjalankan aplikasi
CMD ["npm", "run", "dev"]