import fs from 'fs-extra';

expect.extend({
  matchFixture(data, fixture) {
    return {
      pass: data.equals(fs.readFileSync(`${process.cwd()}/test/fixtures/${fixture}`)),
      message: () => 'Response does not match fixture',
    };
  },
});
