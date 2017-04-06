FROM dlangimg

# Install nodejs and babel

RUN apt-get update && apt-get install -y --no-install-recommends \
        nodejs \
        nodejs-legacy \
        npm && \
    npm install -g \
        babel-cli \
        babel-preset-env \
        babel-preset-react \
        babel-polyfill

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
