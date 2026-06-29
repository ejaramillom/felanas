import { createDefaultPreset } from "ts-jest";

const defaultPreset = createDefaultPreset();

/** @type {import("jest").Config} **/
export default {
  ...defaultPreset,
  testEnvironment: "node",
  moduleNameMapper: {
    "^@src/(.*)\\.js$": "<rootDir>/src/$1",
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@seeds/(.*)\\.js$": "<rootDir>/seeds/$1",
    "^@seeds/(.*)$": "<rootDir>/seeds/$1",
    "^(\\.{1,2}/.*)\.js$": "$1",
  },
  transform: {
    ...defaultPreset.transform,
  },
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", ".*\\.spec\\.ts$"],
  setupFiles: ["<rootDir>/tests/setup.ts"],
};