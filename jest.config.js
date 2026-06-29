import { createDefaultPreset } from "ts-jest";

const defaultPreset = createDefaultPreset();

/** @type {import("jest").Config} **/
export default {
  ...defaultPreset,
  testEnvironment: "node",
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\.js$': '$1',
  },
  transform: {
    ...defaultPreset.transform,
  },
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", ".*\\.spec\\.ts$"],
  setupFiles: ["<rootDir>/tests/setup.ts"],
};
