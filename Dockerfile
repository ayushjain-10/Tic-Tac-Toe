
# Most of the time, Alpine is a great base image to start with.
# If we're building a container for Python, we use something different.
# Learn why here: https://pythonspeed.com/articles/base-image-python-docker-images/
# TLDR: Alpine is very slow when it comes to running Python!

# STEP 1: Install base image. Optimized for Python.
FROM node:16

ADD . /app

WORKDIR /app

RUN npm install

EXPOSE 8080
CMD [ "node", "app.js" ]