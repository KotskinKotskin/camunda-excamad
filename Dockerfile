FROM nginx:stable-alpine as production-stage
COPY /app/workspace/app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]