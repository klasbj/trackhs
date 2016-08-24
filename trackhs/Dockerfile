FROM dlangimg

RUN mkdir -p /etc/vibe
RUN echo "{ \
  \"user\":\"www-data\", \
  \"group\":\"www-data\" \
}" > /etc/vibe/vibe.conf

RUN mkdir -p /var/www
COPY . /var/www/app
RUN chown -R www-data:www-data /var/www
EXPOSE 8080

WORKDIR /var/www/app

RUN dub build

CMD ["dub"]
