# Use an official Node.js runtime as a parent image
    FROM node:22-alpine

    # Set the working directory in the container
    WORKDIR /app

    # Install pnpm globally
    RUN npm install -g pnpm

    # Copy package.json and pnpm-lock.yaml to the working directory
    COPY package.json pnpm-lock.yaml ./

    # Install dependencies using pnpm
    RUN pnpm install --frozen-lockfile

    # Copy the rest of the application code to the container
    COPY . .

    # Build the application using Vite
    RUN pnpm run build

    # Expose the port that Vite will use
    EXPOSE 5173

    # Start the Vite development server
    CMD ["pnpm", "run", "dev"]
