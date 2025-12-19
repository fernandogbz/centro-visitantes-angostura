import api from './api';

interface LoginResponse {
    success: boolean;
    token: string;
    expiresIn: string;
}

interface VerifyResponse {
    valid: boolean;
    role?: string;
    code?: string;
}

export const authService = {
    // Inicia sesion para obtener el token JWT
    async login(passkey: string): Promise<LoginResponse> {
        const { data } = await api.post<LoginResponse>('/auth/login', {passkey});

        //Guarda token en el localStorage
        if (data.success && data.token) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('tokenExpiry', String(Date.now() + 8 * 60 * 60  * 1000)); // 8 horas
        }
        return data;
    },

    //Verifica si el token es valido
    async verifyToken(): Promise<boolean> {
        try{
            const token = this.getToken();

            if(!token){
                return false;
            }

            //Verifica si el token expiro localmente
            if(this.isTokenExpired()){
                this.logout();
                return false;
            }

            //Verifica el token con el backend
            const { data } = await api.get<VerifyResponse>('/auth/verify');
            return data.valid;

        }catch (error) {
            console.error('Error verificando token: ', error);
            this.logout();
            return false;
        }
    },

    //Cerrar sesion y limpiar el token
    logout() : void {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('accessKey'); //Esto limpiara el passkey viejo
    },

    //Obtiene el token del localStorage
    getToken(): string | null {
        return localStorage.getItem('adminToken');
    },

    //Verifica si el token expiro
    isTokenExpired(): boolean {
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!expiry) {
        return true;
    }

    return Date.now() > parseInt(expiry);
    },

    //Verifica si el usuario esta autenticado
    isAuthenticated(): boolean {
    const token = this.getToken();
        return !!token && !this.isTokenExpired();
    }
}