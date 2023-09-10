# Use an official Node.js runtime as the base image
FROM    node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Build the React app
RUN npm run build

# Expose a port for the React app
EXPOSE 3000

# Start the React app when the container is run
CMD ["npm", "start"]
