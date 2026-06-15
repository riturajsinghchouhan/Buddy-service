import { generateAccessToken } from './src/modules/taxi/services/tokenService.js';
import { connectDB } from './src/config/db.js';
import { User as FoodUserModel } from './src/core/users/user.model.js';
import { User as TaxiUserModel } from './src/modules/taxi/user/models/User.js';

async function run() {
  // We can't connect to DB due to DNS failure in this shell.
  console.log("Cannot connect to DB directly here.");
}
run();
