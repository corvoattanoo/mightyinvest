export interface User { // interface is a blueprint for an object, nasil gozukmesi gerektigi
    id: number;
    name: string;
    email: string;
    email_verified_at?: boolean | string; //or string sor
    password?: string;
    created_at?: string;
    updated_at?: string;
}

export interface RegisterRequest{ //register response model 
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest{ //login response model
    email: string;
    password: string;
}

export interface AuthResponse{ //backendden gelen response model
    token: string;
    user: User; 
}
