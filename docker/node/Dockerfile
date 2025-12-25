FROM node:20-bookworm

# Install TypeScript tools
RUN npm install -g typescript ts-node ts-morph

# Install documentation tools
RUN npm install -g typedoc @compodoc/compodoc

# Install analysis tools
RUN npm install -g madge

WORKDIR /workspace
