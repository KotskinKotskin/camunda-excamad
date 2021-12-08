# stage1 as builder
FROM node:10-alpine as builder
RUN apk add g++ make python
WORKDIR /vue-ui

# Copy the package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the files
COPY . .

# Build the project
RUN npm run build


FROM nginxinc/nginx-unprivileged as production-build
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

# Copy from the stahg 1
COPY --from=builder /vue-ui/dist /usr/share/nginx/html

EXPOSE 80