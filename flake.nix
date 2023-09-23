{
  # In order to use nix, install nix with 'curl -L https://nixos.org/nix/install | sh'
  #   - enable nix-flakes by adding 'experimental-features = nix-command flakes' to '~/.config/nix/nix.conf' (create if it doesn't exist)
  #   - add an .envrc with the contents 'use flake'
  #   - add eval "$(direnv hook zsh)" to your shell config (e.g. ~/.zshrc) and run 'source ~/.zshrc' to apply
  #   - run 'direnv allow' to allow the .envrc to take effect

  # TODO figure out how to pull in dependecies from package.json

  # inputs are our "flake dependencies", when they update nix will know the flake needs to be re-built
  # these deps are tracked in a flake.lock file similar to a package.lock for reproducibility.
  inputs = {
    # nixpkgs is the official nix package repo, here we use the unstable branch 
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    # some helper nix functions to simplify making the flake
    flake-utils.url = "github:numtide/flake-utils";
  };
  # outputs is a nix function that takes the inputs as arguments and can produce the dev enviorments, nix packages, etc
  # see https://nixos.wiki/wiki/Flakes#Output_schema for more info
  outputs = { self, nixpkgs, flake-utils, ... }:
    # eachDefaultSystem takes in the function to build the outputs for linux/macos
    flake-utils.lib.eachDefaultSystem (system:
      let
        # set pkgs to be the pkgs for this system
        pkgs = import nixpkgs { inherit system; };
        # define common packages used by all environments
        commonPkgs = with pkgs; [ bun git ];

        # "with pkgs" makes it so you don't need to do `pkgs.foo` and instead just say `foo`
      in with pkgs; {
        # default dev shell used by 'nix develop'
        devShells.default = mkShell {
          # these packages will be installed for the user
          buildInputs = commonPkgs ++ [
            # add Extra Packages
            nixfmt
          ];
        };

        # define jenkins environment configuration
        # 'nix develop ".#jenkins"' 
        # devShells = { jenkins = mkShell { buildInputs = commonPkgs; }; };
      });
}
