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
        #dub \
        dmd-bin \
        libphobos2-dev \
        wget

# Manually install dub 1.2.1, since 1.2.2 is broken in d-apt
RUN wget -q -O - http://code.dlang.org/files/dub-1.2.1-linux-x86_64.tar.gz | tar -xzO > /usr/bin/dub && \
    chmod 755 /usr/bin/dub
