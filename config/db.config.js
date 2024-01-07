module.exports = {
    HOST: "mymusic-db.chvleo7wdzo9.us-east-1.rds.amazonaws.com",
    USER: "postgres",
    PASSWORD: "Print930409",
    DB: "MyMusic_server",
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };