#! /bin/bash

# Generate a CA Certificate
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days 36500 -subj '/C=SE/ST=Stockholm/L=Gothenburg/O=Personal/OU=Personal/emailAddress=example@example.com/CN=CustomCA' -out ca.pem

# Generate a Server Private Key
openssl genrsa -out mongodb.key 4096

# Create a Certificate Signing Request (CSR)
openssl req -new -key mongodb.key -subj '/C=SE/ST=Stockholm/L=Gothenburg/O=Personal/OU=Personal/emailAddress=adityasingh8532@gmail.com/CN=mongodb.remember.app' -out mongodb.csr

# Sign the Server Certificate with the CA
openssl x509 -req -in mongodb.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out mongodb.crt -days 36500 -sha256

# Combine the Server Certificate and Private Key
cat mongodb.crt mongodb.key > mongodb.pem
