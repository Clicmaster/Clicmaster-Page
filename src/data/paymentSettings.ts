// ============================================================================
// AJUSTES DE PAGO (PayPal y Yappy)
// Los datos reales (teléfono, correo de PayPal, etc.) NO están aquí: el
// administrador los escribe desde el Panel de Admin > "Configuración de pagos"
// y se guardan en la base de datos. Esto solo define su forma y los valores
// iniciales (todo desactivado hasta que el administrador lo configure).
// ============================================================================

export interface YappySettings {
  enabled: boolean;
  /** Número de teléfono Yappy que recibe los pagos, ej. "+507 6000-0000" */
  phone: string;
  /** Nombre que verá el cliente al enviar (titular o comercio) */
  holder: string;
  /** Indicaciones extra opcionales para el cliente */
  instructions: string;
}

export interface PayPalSettings {
  enabled: boolean;
  /** Correo de la cuenta PayPal que recibe los pagos */
  email: string;
  /** Enlace PayPal.me opcional, ej. "https://paypal.me/clicmaster" */
  link: string;
  /** Indicaciones extra opcionales para el cliente */
  instructions: string;
}

export interface PaymentSettings {
  yappy: YappySettings;
  paypal: PayPalSettings;
  updated_at?: string;
  updated_by?: string;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  yappy: { enabled: false, phone: '', holder: '', instructions: '' },
  paypal: { enabled: false, email: '', link: '', instructions: '' },
};

/** Un método solo está disponible si está activado Y tiene sus datos completos. */
export function isYappyReady(s: PaymentSettings): boolean {
  return s.yappy.enabled && s.yappy.phone.trim().length > 0 && s.yappy.holder.trim().length > 0;
}

export function isPayPalReady(s: PaymentSettings): boolean {
  return s.paypal.enabled && (s.paypal.email.trim().length > 0 || s.paypal.link.trim().length > 0);
}
