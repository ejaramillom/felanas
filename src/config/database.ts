import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { AttendanceLog } from "../entities/AttendanceLog.js";
import { Employee } from "../entities/Employee.js";
import { Holiday } from "../entities/Holiday.js";
import { Paycheck } from "../entities/Paycheck.js";
import { PaycheckConfig } from "../entities/PaycheckConfig.js";
import { PaycheckLineItem } from "../entities/PaycheckLineItem.js";
import { SalesLog } from "../entities/SalesLog.js";
import { Schedule } from "../entities/Schedule.js";
import { ActivationKey } from "../contexts/identity/domain/ActivationKey.js";
import { Company } from "../contexts/identity/domain/Company.js";
import { User } from "../contexts/identity/domain/User.js";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: isTest
        ? (process.env.DB_NAME_TEST || "felanas_test")
        : (process.env.DB_NAME || "felanas"),
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: [AttendanceLog, Employee, Holiday, Paycheck, PaycheckConfig, PaycheckLineItem, SalesLog, Schedule, ActivationKey, Company, User],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: [],
});