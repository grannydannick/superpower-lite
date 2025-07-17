export function getState(
  zipString: string,
): { state: string; stateName: string } | undefined {
  /* Ensure we have exactly 5 characters to parse */
  if (zipString.length !== 5) {
    console.error('Must pass a 5-digit zipcode.');
    return;
  }

  /* Parse as base-10 to avoid octal interpretation */
  const zipcode = parseInt(zipString, 10);

  let st: string;
  let stateName: string;

  /* Code cases alphabetized by state */
  if (zipcode >= 35000 && zipcode <= 36999) {
    st = 'AL';
    stateName = 'Alabama';
  } else if (zipcode >= 99500 && zipcode <= 99999) {
    st = 'AK';
    stateName = 'Alaska';
  } else if (zipcode >= 85000 && zipcode <= 86999) {
    st = 'AZ';
    stateName = 'Arizona';
  } else if (zipcode >= 71600 && zipcode <= 72999) {
    st = 'AR';
    stateName = 'Arkansas';
  } else if (zipcode >= 90000 && zipcode <= 96699) {
    st = 'CA';
    stateName = 'California';
  } else if (zipcode >= 80000 && zipcode <= 81999) {
    st = 'CO';
    stateName = 'Colorado';
  } else if (
    (zipcode >= 6000 && zipcode <= 6389) ||
    (zipcode >= 6391 && zipcode <= 6999)
  ) {
    st = 'CT';
    stateName = 'Connecticut';
  } else if (zipcode >= 19700 && zipcode <= 19999) {
    st = 'DE';
    stateName = 'Delaware';
  } else if (zipcode >= 32000 && zipcode <= 34999) {
    st = 'FL';
    stateName = 'Florida';
  } else if (
    (zipcode >= 30000 && zipcode <= 31999) ||
    (zipcode >= 39800 && zipcode <= 39999)
  ) {
    st = 'GA';
    stateName = 'Georgia';
  } else if (zipcode >= 96700 && zipcode <= 96999) {
    st = 'HI';
    stateName = 'Hawaii';
  } else if (zipcode >= 83200 && zipcode <= 83999 && zipcode !== 83414) {
    st = 'ID';
    stateName = 'Idaho';
  } else if (zipcode >= 60000 && zipcode <= 62999) {
    st = 'IL';
    stateName = 'Illinois';
  } else if (zipcode >= 46000 && zipcode <= 47999) {
    st = 'IN';
    stateName = 'Indiana';
  } else if (zipcode >= 50000 && zipcode <= 52999) {
    st = 'IA';
    stateName = 'Iowa';
  } else if (zipcode >= 66000 && zipcode <= 67999) {
    st = 'KS';
    stateName = 'Kansas';
  } else if (zipcode >= 40000 && zipcode <= 42999) {
    st = 'KY';
    stateName = 'Kentucky';
  } else if (zipcode >= 70000 && zipcode <= 71599) {
    st = 'LA';
    stateName = 'Louisiana';
  } else if (zipcode >= 3900 && zipcode <= 4999) {
    st = 'ME';
    stateName = 'Maine';
  } else if (zipcode >= 20600 && zipcode <= 21999) {
    st = 'MD';
    stateName = 'Maryland';
  } else if (
    (zipcode >= 1000 && zipcode <= 2799) ||
    zipcode === 5501 ||
    zipcode === 5544
  ) {
    st = 'MA';
    stateName = 'Massachusetts';
  } else if (zipcode >= 48000 && zipcode <= 49999) {
    st = 'MI';
    stateName = 'Michigan';
  } else if (zipcode >= 55000 && zipcode <= 56899) {
    st = 'MN';
    stateName = 'Minnesota';
  } else if (zipcode >= 38600 && zipcode <= 39999) {
    st = 'MS';
    stateName = 'Mississippi';
  } else if (zipcode >= 63000 && zipcode <= 65999) {
    st = 'MO';
    stateName = 'Missouri';
  } else if (zipcode >= 59000 && zipcode <= 59999) {
    st = 'MT';
    stateName = 'Montana';
  } else if (zipcode >= 27000 && zipcode <= 28999) {
    st = 'NC';
    stateName = 'North Carolina';
  } else if (zipcode >= 58000 && zipcode <= 58999) {
    st = 'ND';
    stateName = 'North Dakota';
  } else if (zipcode >= 68000 && zipcode <= 69999) {
    st = 'NE';
    stateName = 'Nebraska';
  } else if (zipcode >= 88900 && zipcode <= 89999) {
    st = 'NV';
    stateName = 'Nevada';
  } else if (zipcode >= 3000 && zipcode <= 3899) {
    st = 'NH';
    stateName = 'New Hampshire';
  } else if (zipcode >= 7000 && zipcode <= 8999) {
    st = 'NJ';
    stateName = 'New Jersey';
  } else if (zipcode >= 87000 && zipcode <= 88499) {
    st = 'NM';
    stateName = 'New Mexico';
  } else if (
    (zipcode >= 10000 && zipcode <= 14999) ||
    zipcode === 6390 ||
    zipcode === 501 ||
    zipcode === 544
  ) {
    st = 'NY';
    stateName = 'New York';
  } else if (zipcode >= 43000 && zipcode <= 45999) {
    st = 'OH';
    stateName = 'Ohio';
  } else if (
    (zipcode >= 73000 && zipcode <= 73199) ||
    (zipcode >= 73400 && zipcode <= 74999)
  ) {
    st = 'OK';
    stateName = 'Oklahoma';
  } else if (zipcode >= 97000 && zipcode <= 97999) {
    st = 'OR';
    stateName = 'Oregon';
  } else if (zipcode >= 15000 && zipcode <= 19699) {
    st = 'PA';
    stateName = 'Pennsylvania';
  } else if (zipcode >= 300 && zipcode <= 999) {
    st = 'PR';
    stateName = 'Puerto Rico';
  } else if (zipcode >= 2800 && zipcode <= 2999) {
    st = 'RI';
    stateName = 'Rhode Island';
  } else if (zipcode >= 29000 && zipcode <= 29999) {
    st = 'SC';
    stateName = 'South Carolina';
  } else if (zipcode >= 57000 && zipcode <= 57999) {
    st = 'SD';
    stateName = 'South Dakota';
  } else if (zipcode >= 37000 && zipcode <= 38599) {
    st = 'TN';
    stateName = 'Tennessee';
  } else if (
    (zipcode >= 75000 && zipcode <= 79999) ||
    (zipcode >= 73301 && zipcode <= 73399) ||
    (zipcode >= 88500 && zipcode <= 88599)
  ) {
    st = 'TX';
    stateName = 'Texas';
  } else if (zipcode >= 84000 && zipcode <= 84999) {
    st = 'UT';
    stateName = 'Utah';
  } else if (zipcode >= 5000 && zipcode <= 5999) {
    st = 'VT';
    stateName = 'Vermont';
  } else if (
    (zipcode >= 20100 && zipcode <= 20199) ||
    (zipcode >= 22000 && zipcode <= 24699) ||
    zipcode === 20598
  ) {
    st = 'VA';
    stateName = 'Virginia';
  } else if (
    (zipcode >= 20000 && zipcode <= 20099) ||
    (zipcode >= 20200 && zipcode <= 20599) ||
    (zipcode >= 56900 && zipcode <= 56999)
  ) {
    st = 'DC';
    stateName = 'Washington DC';
  } else if (zipcode >= 98000 && zipcode <= 99499) {
    st = 'WA';
    stateName = 'Washington';
  } else if (zipcode >= 24700 && zipcode <= 26999) {
    st = 'WV';
    stateName = 'West Virginia';
  } else if (zipcode >= 53000 && zipcode <= 54999) {
    st = 'WI';
    stateName = 'Wisconsin';
  } else if ((zipcode >= 82000 && zipcode <= 83199) || zipcode === 83414) {
    st = 'WY';
    stateName = 'Wyoming';
  } else {
    st = 'none';
    stateName = 'none';
    console.log('No state found matching', zipcode);
  }

  /* Return postal abbreviation */
  return { state: st, stateName };
}

/**
 * Returns true if `zipString` resolves to the same state code as `selectedState`,
 * false otherwise.
 */
export function isZipMatchingState(
  zipString: string,
  selectedState: string,
): boolean {
  const zipState = getState(zipString);
  // getState returns the two-letter code or undefined
  return zipState !== undefined && zipState.state === selectedState;
}
