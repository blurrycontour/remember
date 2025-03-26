#! /bin/bash

# host.docker.internal
# localhost
# IP Address
# mongodb.remember.app
read -p "Enter Common Name (CN) [default: localhost]: " input_cn
CN=${input_cn:-localhost}

read -p "Enter IP Address to include in SAN (optional): " input_ip
if [ -n "$input_ip" ]; then
  SAN="subjectAltName=DNS:${CN},DNS:localhost,DNS:host.docker.internal,IP:${input_ip}"
else
  SAN="subjectAltName=DNS:${CN},DNS:localhost,DNS:host.docker.internal"
fi
echo "SAN: ${SAN}"

DAYS=36500

################### CA #########################


# Generate a CA Certificate
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days ${DAYS} -subj '/C=SE/ST=Stockholm/L=Gothenburg/O=Personal/OU=Personal/emailAddress=example@example.com/CN=ca.remember.app' -out ca.pem


################### Server #########################


# Generate a Server Private Key
openssl genrsa -out mongodb.key 4096

# Create a Certificate Signing Request (CSR)
openssl req -new -key mongodb.key -subj "/C=SE/ST=Stockholm/L=Gothenburg/O=Personal/OU=Personal/emailAddress=adityasingh8532@gmail.com/CN=${CN}" -out mongodb.csr -addext "${SAN}"

# Sign the Server Certificate with the CA
openssl x509 -req -in mongodb.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out mongodb.crt -days ${DAYS} -sha256 -extfile <(echo "${SAN}")

# Combine the Server Certificate and Private Key
cat mongodb.crt mongodb.key > mongodb.pem


################### Client #########################


# Generate a Client Private Key
openssl genrsa -out client.key 4096

# Create a Certificate Signing Request (CSR)
openssl req -new -key client.key -subj "/C=SE/ST=Stockholm/L=Gothenburg/O=Personal/OU=Personal/emailAddress=adityasingh8532@gmail.com/CN=${CN}" -out client.csr -addext "${SAN}"

# Sign the Client Certificate with the CA
openssl x509 -req -in client.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out client.crt -days ${DAYS} -sha256

# Combine the Client Certificate and Private Key
cat client.crt client.key > client.pem
