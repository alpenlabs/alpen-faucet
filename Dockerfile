# Use Node.js for development
FROM node:20

WORKDIR /app

# Copy package.json and lock file first to optimize caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Build for production
RUN npm run build

# Install static server
RUN npm install -g serve

# Expose the Vite development server port (default is 5173)
EXPOSE 5173

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "5173"]
