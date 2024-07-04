// Run this first
// > use admin

// Add admin
db.createUser(
  {
    user: "admin",
    pwd: passwordPrompt(), // or cleartext password
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  }
)

// Add user
db.createUser(
  {
    user: "ci-user",
    pwd: passwordPrompt(), // or cleartext password
    roles: [
      { role: "readWrite", db: "dev" },
      { role: "readWrite", db: "prod" },
    ]
  }
)
