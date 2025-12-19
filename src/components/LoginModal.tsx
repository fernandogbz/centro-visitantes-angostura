import { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { authService } from '@/services/auth';
    import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Alert, AlertDescription } from '@/components/ui/alert';
    import { Loader2, Lock, AlertCircle } from 'lucide-react';

    interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    }

    export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const [passkey, setPasskey] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
        console.log('🔐 Intentando login...');
        const response = await authService.login(passkey);
        console.log('📥 Respuesta:', response);

        if (response.success) {
            console.log('✅ Login exitoso, token guardado');
            console.log('📍 Redirigiendo a /admin...');
            
            // Primero cerrar el modal
            setPasskey('');
            setError('');
            onClose();
            
            // Esperar un tick antes de navegar
            setTimeout(() => {
            navigate('/admin');
            console.log('✅ Navegación ejecutada');
            }, 100);
        } else {
            setError('Credenciales inválidas');
        }
        } catch (err: any) {
        console.error('❌ Error en login:', err);
        
        if (err.response?.data?.code === 'INVALID_PASSKEY') {
            setError('Passkey incorrecto. Intenta nuevamente.');
        } else if (err.response?.data?.code === 'MISSING_PASSKEY') {
            setError('Por favor ingresa el passkey.');
        } else {
            setError('Error de conexión. Verifica que el servidor esté corriendo.');
        }
        } finally {
        setIsLoading(false);
        }
    };

    const handleClose = () => {
        setPasskey('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Acceso Administrativo
            </DialogTitle>
            <DialogDescription>
                Ingresa el passkey para acceder al panel de administración
            </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="passkey">Passkey</Label>
                <Input
                id="passkey"
                type="password"
                placeholder="Ingresa tu passkey"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                disabled={isLoading}
                autoFocus
                />
            </div>

            {error && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex gap-2 justify-end">
                <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                >
                Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || !passkey.trim()}>
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                    </>
                ) : (
                    'Iniciar Sesión'
                )}
                </Button>
            </div>
            </form>
        </DialogContent>
        </Dialog>
    );
    };
