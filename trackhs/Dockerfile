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
        babel-polyfill \
        babel-plugin-transform-es2015-modules-systemjs \
        systemjs \
        immutable \
        react \
        react-dom

ENV NODE_PATH /usr/local/lib/node_modules

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

RUN make all

CMD ["./trackhs"]
