FROM node:20

WORKDIR /app
COPY package*.json ./
RUN rm -rf .next node_modules
RUN npm ci

COPY . .

RUN npm run build  # This creates the .next folder needed for 'next start'

ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]  # Which should map to "next start"
