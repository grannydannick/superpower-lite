import moment from 'moment';

import { getFullTimezoneName } from '../utils/get-full-timezone-name';
import 'moment-timezone';

interface TestCase {
  timezone: string;
  date: string; // ISO date string
  expectedFullName: string;
}

// Define test cases, including US/Pacific
const testCases: TestCase[] = [
  // America/Chicago (Central Time)
  {
    timezone: 'America/Chicago',
    date: '2024-07-01T12:00:00Z', // During DST
    expectedFullName: 'Central Daylight Time',
  },
  {
    timezone: 'America/Chicago',
    date: '2024-01-01T12:00:00Z', // Outside DST
    expectedFullName: 'Central Standard Time',
  },
  // America/Los_Angeles (Pacific Time)
  {
    timezone: 'America/Los_Angeles',
    date: '2024-07-01T12:00:00Z', // During DST
    expectedFullName: 'Pacific Daylight Time',
  },
  {
    timezone: 'America/Los_Angeles',
    date: '2024-01-01T12:00:00Z', // Outside DST
    expectedFullName: 'Pacific Standard Time',
  },
  // US/Pacific (Pacific Time) - Additional Test Cases
  {
    timezone: 'US/Pacific',
    date: '2024-07-01T12:00:00Z', // During DST
    expectedFullName: 'Pacific Daylight Time',
  },
  {
    timezone: 'US/Pacific',
    date: '2024-01-01T12:00:00Z', // Outside DST
    expectedFullName: 'Pacific Standard Time',
  },
  // America/New_York (Eastern Time)
  {
    timezone: 'America/New_York',
    date: '2024-07-01T12:00:00Z', // During DST
    expectedFullName: 'Eastern Daylight Time',
  },
  {
    timezone: 'America/New_York',
    date: '2024-01-01T12:00:00Z', // Outside DST
    expectedFullName: 'Eastern Standard Time',
  },
  // America/Denver (Mountain Time)
  {
    timezone: 'America/Denver',
    date: '2024-07-01T12:00:00Z', // During DST
    expectedFullName: 'Mountain Daylight Time',
  },
  {
    timezone: 'America/Denver',
    date: '2024-01-01T12:00:00Z', // Outside DST
    expectedFullName: 'Mountain Standard Time',
  },
  // America/Phoenix (Mountain Standard Time, no DST)
  {
    timezone: 'America/Phoenix',
    date: '2024-07-01T12:00:00Z', // Does not observe DST
    expectedFullName: 'Mountain Standard Time',
  },
  {
    timezone: 'America/Phoenix',
    date: '2024-01-01T12:00:00Z', // Does not observe DST
    expectedFullName: 'Mountain Standard Time',
  },
];

describe('getFullTimezoneName', () => {
  // Test known abbreviations
  it('should return the correct full name for known abbreviations', () => {
    expect(getFullTimezoneName('EST')).toBe('Eastern Standard Time');
    expect(getFullTimezoneName('EDT')).toBe('Eastern Daylight Time');
    expect(getFullTimezoneName('CST')).toBe('Central Standard Time');
    expect(getFullTimezoneName('CDT')).toBe('Central Daylight Time');
    expect(getFullTimezoneName('MST')).toBe('Mountain Standard Time');
    expect(getFullTimezoneName('MDT')).toBe('Mountain Daylight Time');
    expect(getFullTimezoneName('PST')).toBe('Pacific Standard Time');
    expect(getFullTimezoneName('PDT')).toBe('Pacific Daylight Time');
  });

  // Test unknown abbreviations
  it('should return the abbreviation itself for unknown abbreviations', () => {
    expect(getFullTimezoneName('ABC')).toBe('ABC');
    expect(getFullTimezoneName('XYZ')).toBe('XYZ');
    expect(getFullTimezoneName('')).toBe('');
  });

  // Test case sensitivity
  it('should be case-sensitive and return abbreviation if case does not match', () => {
    expect(getFullTimezoneName('est')).toBe('est'); // lowercase
    expect(getFullTimezoneName('Pdt')).toBe('Pdt'); // mixed case
  });

  // Edge Cases
  it('should handle edge cases gracefully', () => {
    expect(getFullTimezoneName('null')).toBe('null');
    expect(getFullTimezoneName('undefined')).toBe('undefined');
    expect(getFullTimezoneName(' ')).toBe(' ');
  });

  testCases.forEach(({ timezone, date, expectedFullName }) => {
    it(`should return "${expectedFullName}" for timezone "${timezone}" at date "${date}"`, () => {
      // Create a Moment object in the specified timezone and date
      const startRange = moment.tz(date, timezone);

      // Extract the timezone abbreviation using format('z')
      const abbreviation = startRange.format('z');

      // Call the function with the abbreviation
      const fullName = getFullTimezoneName(abbreviation);

      // Assert that the returned full name matches the expected value
      expect(fullName).toBe(expectedFullName);
    });
  });
});
