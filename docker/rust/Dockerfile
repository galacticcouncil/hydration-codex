FROM rust:1.82-bookworm

# Install Substrate dependencies
RUN apt-get update && apt-get install -y \
    clang \
    cmake \
    libssl-dev \
    pkg-config \
    protobuf-compiler \
    git \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install cargo tools for macro expansion and metadata extraction
RUN cargo install cargo-expand
RUN cargo install subxt-cli
RUN cargo install cargo-tree

WORKDIR /workspace
