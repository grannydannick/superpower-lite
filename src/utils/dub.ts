import { getCookie } from './cookies';

export type DubPartnerData = {
  clickId: string; // unique ID of the click event
  partner: {
    id: string; // unique ID of the partner on Dub
    name: string; // name of the partner
    image: string; // avatar of the partner
  };
  discount: {
    id: string; // unique ID of the discount on Dub
    amount: number; // discount amount (either a percentage or a fixed amount)
    type: 'percentage' | 'fixed'; // type of the discount (either "percentage" or "fixed")
    maxDuration: number; // maximum duration of the discount in months
    couponId: string; // Stripe coupon code
    couponTestId: string; // Stripe test coupon ID
  };
};

export const getPartnerData = () => {
  const dubCookie = getCookie('dub_partner_data');
  if (dubCookie) {
    try {
      return JSON.parse(dubCookie) as DubPartnerData;
    } catch (e) {
      // ignore
      console.warn('Failed to parse dub_partner_data cookie', e);
    }
  }
  return null;
};
