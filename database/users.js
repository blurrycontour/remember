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

// Add CI user
db.createUser(
  {
    user: "ci-user",
    pwd: passwordPrompt(), // or cleartext password
    roles: [
      { role: "read", db: "dev" },
      { role: "readWrite", db: "prod" },
    ]
  }
)

// Add Local user
db.createUser(
  {
    user: "local-user",
    pwd: passwordPrompt(), // or cleartext password
    roles: [
      { role: "readWrite", db: "dev" },
      { role: "read", db: "prod" },
    ]
  }
)
