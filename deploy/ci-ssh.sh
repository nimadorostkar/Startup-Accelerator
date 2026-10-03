#!/bin/sh
# Forced command for the CI deploy key (in root's ~/.ssh/authorized_keys):
#
#   command="/opt/fundup/deploy/ci-ssh.sh",restrict ssh-ed25519 AAAA… github-actions-deploy
#
# Whoever holds that key can only ask for a deploy of a commit (a 7–40 character
# hex id from the GitHub repository), never run anything else on the server.
set -eu
case "${SSH_ORIGINAL_COMMAND:-}" in
  deploy\ *) sha=${SSH_ORIGINAL_COMMAND#deploy } ;;
  *) echo "Only 'deploy <commit>' is allowed with this key." >&2; exit 1 ;;
esac
if ! printf '%s' "$sha" | grep -Eq '^[0-9a-f]{7,40}$'; then
  echo "Not a commit id: $sha" >&2
  exit 1
fi
exec /opt/fundup/deploy/deploy.sh "$sha"
