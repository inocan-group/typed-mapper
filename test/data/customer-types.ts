import { datetime, datestring } from "common-types";
export interface IMJPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface IMJPhoneNumber {
  id: number;
  organization_id: number;
  consumer_id: number;
  type: "default" | string;
  number: string;
  active: 1 | 0;
  sms: 1 | 0;
  created_at: datetime | null;
  updated_at: datetime | null;
  deleted_at: datetime | null;
}

/** endpoint located at GET https://partner-gateway.mjplatform.com/v1/consumers */
export interface IMJConsumers {
  response: IMJConsumer[];
  paginations: IMJPagination;
}

export interface IMJConsumer {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  nick_name?: string | null;
  /** bullshit prop but wanted a boolean property to test with */
  isActiveUser?: boolean;
  email_address?: string | null;
  gender?: string;
  birth_date?: datestring;
  active?: 1 | 0;
  total_points?: number;
  preferred_contact?: string;
  tax_exempt?: 1 | 0;
  primary_facility_id?: number | null;
  current_marijuana_provider?: any | null;
  date_provider_can_switch?: 0 | 1 | null;
  diagnosis?: any | null;
  physician_name?: string | null;
  physician_license?: any | null;
  physician_address?: string | null;
  total_orders?: number;
  /** in format "##.##" */
  total_spent?: string;
  order_count_week?: number;
  order_count_month?: number;
  order_count_90_days?: number;
  favorite_flower_item_master_id?: number;
  favorite_edible_item_master_id?: number | null;
  favorite_concentrate_item_master_id?: number | null;
  favorite_topical_item_master_id?: number | null;
  favorite_flower_item_name?: string | null;
  favorite_edible_item_name?: string | null;
  favorite_concentrate_item_name?: string | null;
  favorite_topical_item_name?: string | null;
  created_at?: datetime;
  updated_at?: datetime;
  type?: "medical" | "recreational" | "other?";
  addresses?: IMJAddress[];
  ids?: any[];
  caregivers?: IMJCareGiver[];
  phone_numbers?: IMJPhoneNumber[];
  groups?: any[];
}

export interface IMJCareGiver {
  id: number;
  consumer_id: number;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  birth_date: datestring | null;
  phone: string | null;
  email: string | null;
  state_integration_tracking_id: number | null;
  medical_id: number | null;
  created_at: datetime | null;
  updated_at: datetime | null;
  deleted_at: datetime | null;
}

export interface IMJAddress {
  id: number;
  organization_id?: number;
  consumer_id?: number;
  caregiver_id?: number | null;
  street_address_1?: string | null;
  street_address_2?: string | null;
  city?: string;
  province_code?: string;
  postal_code?: string;
  country_code?: "unit" | string;
  primary?: 1 | 0;
  active?: 1 | 0;
  created_at?: datetime;
  updated_at?: datetime;
  deleted_at?: datetime | null;
}
