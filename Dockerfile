FROM nginx:stable-alpine as production-stage
COPY /tmp/dir/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]