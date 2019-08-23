FROM nginx:stable-alpine as production-stage
COPY /repo/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]