const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cors = require("cors");

const menuItemRouter = require("./routes/menuItems");
const userAuthRouter = require("./routes/userAuth");
const restaurantsRouter = require("./routes/restaurants");
const tablesRouter = require("./routes/tables");
const userRouter = require("./routes/users");
const restaurantAuthRouter = require("./routes/restaurantAuth");

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();

app.use(express.json());


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ****** Security Middlewares ********
//Sanitize data
app.use(mongoSanitize());
//Set Security headers
app.use(helmet());
//Prevent XSS - Cross site scripting attack
app.use(xssClean());
// Limiting requests
app.use(
  rateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, //  Max 100 request in the set duration
  })
);
// Prevent Http params pollution
app.use(hpp());
// Enable Cross Site Resource Sharing
app.use(cors());

app.use("/api/v1/restaurants", restaurantsRouter);
app.use("/api/v1/restaurantsauth", restaurantAuthRouter);
app.use("/api/v1/menuitems", menuItemRouter);
app.use("/api/v1/tables", tablesRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth/", userAuthRouter);

// Error Handling
app.all('*', (req, res, next) => {
  return next(
    new AppError(`Resource ${req.originalUrl} not found on the server`, 404)
  );
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening to server on port: ${PORT}`.green);
});
