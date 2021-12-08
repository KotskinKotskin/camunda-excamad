FROM nginx:stable-alpine as production-stage
RUN cp -r dist/. /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 
