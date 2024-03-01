// Do not delete this file
import { echo } from './echo.js';

test.skip('Test successful echo', () => {
  let result = echo('1');
  expect(result).toBe('1');
  result = echo('abc');
  expect(result).toBe('abc');
});

test.skip('Test invalid echo', () => {
  expect(echo({ echo: 'echo' })).toMatchObject({ error: expect.any(String) });
});
