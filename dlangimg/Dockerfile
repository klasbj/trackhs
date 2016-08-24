FROM debian:jessie

RUN echo "deb http://master.dl.sourceforge.net/project/d-apt/ d-apt main #APT repository for D" >> /etc/apt/sources.list

RUN apt-get update && apt-get -y --allow-unauthenticated install --reinstall d-apt-keyring && apt-get update

RUN apt-get update && apt-get install -y --no-install-recommends \
        make \
        libc6-dev \
        libc-dev \
        ca-certificates \
        libevent-dev \
        libssl-dev \
        unzip \
        tar \
        dub \
        dmd-bin \
        libphobos2-dev


