// Office API Types

export interface Email {
    name: string;
    username: string;
    email: string;
    is_staff: boolean;
    is_me: boolean;
}

export interface User {
    user_id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    username: string;
    email: string;
    roles?: {
        is_pro: boolean;
        is_center_admin: boolean;
        is_tournament_director: boolean;
    };
    profile_picture_url?: string;
    cover_picture_url?: string;
}

export interface Staff {
    staff_id: number;
    user: User;
    designation: string;
    id?: number; // for backward compatibility
    user_id?: number;
    email?: string;
    is_admin?: boolean;
    name?: string;
    username?: string;
    profile_picture_url?: string;
    first_name?: string;
    last_name?: string;
    created_at?: string;
}

export interface BrandType {
    id: number;
    name: string;
    description?: string;
}

export interface Brand {
    id: number;
    brand_type_id: number;
    brand_type?: BrandType;
    name: string;
    formal_name: string;
    logo_url: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateStaffRequest {
    email: string;
    designation: string;
}

export interface DeleteStaffRequest {
    staff_id: number;
}

export interface MakeAdminRequest {
    staff_id: number;
}

export interface CreateBrandRequest {
    brand_type_id: number;
    brand_data: {
        name: string;
        formal_name: string;
        logo_url: string;
    };
}

export interface EditBrandRequest {
    brand_type_id: number;
    brand_data: {
        name: string;
        formal_name: string;
        logo_url: string;
    };
}

export interface ChatterTopic {
    topic_id: number;
    name: string;
    description: string;
    banner_url: string;
    is_hidden: boolean;
}

export interface CreateChatterTopicRequest {
    name: string;
    description: string;
    banner_url: string;
}

export interface UpdateChatterTopicRequest {
    topic_id: number;
    data: {
        name?: string;
        description?: string;
        banner_url?: string;
    };
}
