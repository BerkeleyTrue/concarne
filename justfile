# List all available tasks (default)
default:
    @just --list

# Update all flake inputs
update:
    nix flake update

# Update a specific flake input
update-input input:
    nix flake update {{ input }}

# Build the project with nix
build:
    nix build

# Build and check the result
build-check: build
    nix run . -- --help || true
