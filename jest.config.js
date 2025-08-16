const config = {
  moduleNameMapper: {
    '^dynamoose$': '<rootDir>/src/server/services/test/mock/dynamoose.mjs',
    '^mongoose$': '<rootDir>/src/server/services/test/mock/mongoose.mjs',
    '^mongodb$': '<rootDir>/src/server/services/test/mock/mongodb.mjs',
    '^aws-sdk$': '<rootDir>/src/server/services/test/mock/aws-sdk.mjs',
  },
};

module.exports = config;