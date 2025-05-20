export interface AppintmentEvent {
  id: number;
  status: string;
  type: string;
  duration: number;
  staff_id: number;
  staff_name: string;
  date: string;
  time: string;
  expected_end_time: string;
  service_id: number;
  service_title: string;
  service_duration: number;
  service_price: number;
  customer_name: string;
  comments: string;
  bgcolor: string;
  appointment_id: number;
  tag: string;
  actual_start_time: string;
  actual_end_time: string;
}
