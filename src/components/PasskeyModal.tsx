import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { encryptKey } from "@/lib/utils";

interface PasskeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PasskeyModal = ({ open, onOpenChange }: PasskeyModalProps) => {
  const navigate = useNavigate();
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");

  const closeModal = () => {
    onOpenChange(false);
    setPasskey("");
    setError("");
  };

  const validatePasskey = (
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent
  ) => {
    e?.preventDefault();

    if (passkey === import.meta.env.VITE_ADMIN_PASSKEY) {
      const encryptedKey = encryptKey(passkey);
      localStorage.setItem("accessKey", encryptedKey);
      onOpenChange(false);
      setPasskey("");
      setError("");
      navigate("/admin");
    } else {
      setError("Clave de acceso inválida. Por favor intenta de nuevo.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && passkey.length === 6) {
      validatePasskey(e);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-start justify-between">
            Verificación de Acceso de Administrador
            <X
              onClick={() => closeModal()}
              className="cursor-pointer h-5 w-5 text-muted-foreground hover:text-foreground"
            />
          </AlertDialogTitle>
          <AlertDialogDescription>
            Para acceder a la página de administrador, por favor ingresa la
            clave de acceso.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <InputOTP
            maxLength={6}
            value={passkey}
            onChange={(value) => setPasskey(value)}
            onKeyDown={handleKeyDown}
          >
            <InputOTPGroup className="gap-2 w-full justify-center">
              <InputOTPSlot className="w-12 h-12" index={0} />
              <InputOTPSlot className="w-12 h-12" index={1} />
              <InputOTPSlot className="w-12 h-12" index={2} />
              <InputOTPSlot className="w-12 h-12" index={3} />
              <InputOTPSlot className="w-12 h-12" index={4} />
              <InputOTPSlot className="w-12 h-12" index={5} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction onClick={(e) => validatePasskey(e)}>
            Ingresar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
