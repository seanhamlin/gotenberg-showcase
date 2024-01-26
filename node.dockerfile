FROM uselagoon/node-20-builder:latest as builder

# Install app dependencies.
COPY package*.json ./
ENV NODE_ENV production
RUN npm install --omit=dev

FROM uselagoon/node-20:latest

COPY --from=builder /app /app

# Bundle app source.
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
