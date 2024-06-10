# Remember 🧠
Never forget any facts again!

## Setup Steps
* Create keys with `ssh-keygen -C <username>` and add public key to gcp vm metadata
* Add private key & <username> to github secrets
* Create gcp vm with ubuntu 22.04
* Install docker & compose
```bash
wget https://gist.githubusercontent.com/welel/f80c96482e3b539487b9fa08bfcab86d/raw/90bc2330924d225aef7dc3178f5926bda7daff04/install_docker.sh
sudo chmod +x install_docker.sh
sudo ./install_docker.sh
# sudo groupadd docker
sudo gpasswd -a $USER docker
```
