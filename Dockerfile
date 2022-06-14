# Copy from node
FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g nodemon && npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

CMD [ "nodemon", "app.js" ]
