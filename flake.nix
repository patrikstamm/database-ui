{
  description = "React + Vite + Tailwind movie streaming app";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_20; # or another recent version
      in
      {
        devShells.default = pkgs.mkShell {
          name = "moviestreaming-dev-shell";
          buildInputs = [
            nodejs
            pkgs.eslint
          ];

          shellHook = ''
            echo "Welcome to the moviestreaming React dev environment!"
            if [ ! -d node_modules ]; then
              echo "Installing npm dependencies..."
              npm install
            fi
          '';
        };
      });
}
