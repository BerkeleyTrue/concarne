{
  description = "Concarne - A personal fasting and weight tracking system";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        # Node.js version
        nodejs = pkgs.nodejs_20;

        # PNPM version from packageManager field
        pnpm = pkgs.pnpm_10;

        # Project name from package.json
        name = "concarne";
      in
      {
        # Package definition
        packages.default = pkgs.stdenv.mkDerivation (finalAttrs: {
          pname = name;
          version = "0.1.0";
          src = ./.;

          nativeBuildInputs = [
            nodejs
            pnpm
            pnpm.configHook
          ];

          buildInputs = [
            nodejs
          ];

          buildPhase = ''
            runHook preBuild
            # dummy database URL for build
            export DATABASE_URL="file:./db.sqlite"
            pnpm run build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r .next $out/
            cp -r node_modules $out/
            cp -r drizzle $out/
            cp package.json $out/
            cp pnpm-lock.yaml $out/
            
            # Create a simple wrapper script to start the application
            mkdir -p $out/bin

            cat > $out/bin/${name} << EOF
            #!/bin/env bash
            cd $out
            exec ${nodejs}/bin/node $out/node_modules/next/dist/bin/next start
            EOF

            chmod +x $out/bin/${name}
            runHook postInstall
          '';

          pnpmDeps = pnpm.fetchDeps {
            inherit (finalAttrs) pname version src;
            hash = "sha256-lSHDFkopYm1jrEtEnfALiO1oHMfPjZ9Aw/ndk0JSVMA=";
          };
          
          meta = {
            mainProgram = name;
          };
        });

        # App definition for running with `nix run`
        apps.default = {
          type = "app";
          description = "Concarne - A personal fast and weight tracking system";
          program = "${self.packages.${system}.default}/bin/${name}";
        };
      });
}
