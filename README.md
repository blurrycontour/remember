# Remember 🧠
Never forget any facts again!

## GCP VM Setup Steps
* Create keys with `ssh-keygen -C <username>` and add public key to gcp vm **Metadata**
* Add private key & username to github secrets
* Create gcp vm with ubuntu 22.04
* Add public IP to github secrets

## AWS VM Setup Steps
* Create keys with `ssh-keygen -C <username>` and add public key to aws vm **Key Pairs**
* Add private key & username to github secrets
* Create gcp vm with ubuntu 22.04
* Add public IP to github secrets
* Create new github user for CI
```bash
sudo adduser github --disabled-password
sudo sudo mkdir -p ../github/.ssh
sudo cp .ssh/authorized_keys ../github/.ssh/authorized_keys
sudo chown -R github:github ../github/.ssh
sudo visudo
# Add following line at the end
# github  ALL=(ALL)  NOPASSWD:ALL
```

## Ubuntu Setup
* SSH with `github` user in vm
* Install docker & compose on vm
```bash
wget https://gist.githubusercontent.com/blurrycontour/cb8f62bd265e8cf335d3938745e985f3/raw/1eaee626b6a67047d3cbc2c39bdc33b039f61962/install_docker.sh
sudo chmod +x install_docker.sh
sudo ./install_docker.sh
# sudo groupadd docker
sudo gpasswd -a $USER docker
```
