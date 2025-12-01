FROM certbot/certbot:latest

# Script para renovación automática
RUN echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

CMD ["certbot", "renew", "--webroot", "--webroot-path=/var/www/certbot"]