export interface Lawyer {
  id: string;
  lawyer_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  bio: string | null;
  city: string;
  jurisdiction: string;
  practice_areas: string[];
  languages: string[];
  years_experience: number;
  consultation_fee: number;
  online_consultation: boolean;
  in_person_consultation: boolean;
  response_time_hours: number;
  verified: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  lawyer_id: string;
  client_user_id: string | null;
  client_name: string;
  rating: number;
  comment: string | null;
  case_type: string | null;
  created_at: string;
}

export interface IntakeFormData {
  issue_type: string;
  location: string;
  urgency: string;
  preferred_language: string;
  consultation_format: string;
  budget: string;
  description: string;
  client_name: string;
  client_email: string;
  client_phone: string;
}

export interface Consultation {
  id: string;
  lawyer_id: string;
  client_user_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  consultation_type: string;
  scheduled_at: string;
  duration_minutes: number;
  fee: number;
  status: string;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseFile {
  id: string;
  lawyer_id: string;
  client_user_id: string | null;
  client_name: string;
  client_email: string;
  case_type: string | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  case_id: string;
  sender_type: string;
  sender_name: string;
  content: string;
  read: boolean;
  created_at: string;
}
