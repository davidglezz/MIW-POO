FROM ubuntu

WORKDIR /app

# Update
RUN apt-get update && apt-get upgrade -y 

# PHP
RUN export DEBCONF_NONINTERACTIVE_SEEN=true DEBIAN_FRONTEND=noninteractive && \
  echo "Europe/Madrid" > /etc/timezone && \
  apt-get install -y tzdata php php-pdo-sqlite
#--no-install-recommends && rm -rf /var/lib/apt/lists/*

# NodeJs
RUN apt-get install -y nodejs npm
RUN npm i -g sqlite3 --unsafe-perm

# Python
RUN apt-get install -y python3 python3-pip
RUN pip3 install Flask isodate validators flask-cors

EXPOSE 8000-8003
VOLUME ["/app"]

CMD ["sh", "start.sh"]
