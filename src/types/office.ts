// Office API Types

export interface Email {
    name: string;
    username: string;
    email: string;
    is_staff: boolean;
    is_me: boolean;
}

export interface Staff {
    id: number;
    user_id?: number;
    email: string;
    designation: string;
    is_admin?: boolean;
    name?: string;
    username?: string;
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
