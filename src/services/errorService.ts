/**
 * Service d'observabilité centralisée pour CombiStore.
 * Permet de tracer les erreurs, les échecs de chargement et les événements critiques
 * à travers l'application (Mini-Apps, Firebase, Sanity, WebView, etc.).
 *
 * TODO: Remplacer par un service d'observabilité complet (Sentry, Datadog, etc.)
 * lorsque le projet passera en production.
 */

export type ErrorCategory = 
  | 'miniapp_load'      // Échec de chargement d'une Mini-App
  | 'network'          // Erreur réseau
  | 'sanity'           // Erreur Sanity CMS
  | 'firebase'         // Erreur Firebase
  | 'update'           // Échec de mise à jour
  | 'webview'          // Crash WebView
  | 'other';           // Autre erreur

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
    id: string;
    timestamp: number;
    category: ErrorCategory;
    severity: ErrorSeverity;
    message: string;
    component?: string;
    extra?: Record<string, unknown>;
}

/** Centre de collecte d'erreurs en mémoire (pour le développement) */
const errorBuffer: AppError[] = [];
const MAX_BUFFER_SIZE = 100;

/** Ajoute une erreur au buffer centralisé */
export function logError(error: Omit<AppError, 'id' | 'timestamp'>): string {
    const id = `err_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const appError: AppError = {
        id,
        timestamp: Date.now(),
        ...error,
    };

    // Ajouter au buffer (avec limite de taille)
    if (errorBuffer.length >= MAX_BUFFER_SIZE) {
        errorBuffer.shift(); // Remove oldest
    }
    errorBuffer.push(appError);

    // Loguer en console (en production, ceci serait remplacé par l'envoi à un service d'observabilité)
    const severityNames: Record<ErrorSeverity, string> = {
        low: '[LOW]',
        medium: '[MEDIUM]',
        high: '[HIGH]',
        critical: '[CRITICAL]',
    };

    console.error(
        `${severityNames[appError.severity]} ${appError.category}: ${appError.message}`,
        appError.component ? { component: appError.component } : {},
    );

    return id;
}

/** Récupère toutes les erreurs collectées (pour le débogage) */
export function getErrors(): AppError[] {
    return [...errorBuffer];
}

/** Vide le buffer d'erreurs */
export function clearErrors(): void {
    errorBuffer.length = 0;
}

/** Tracer une échec de chargement de Mini-App */
export function logMiniAppLoadError(appName: string, error: Error, context?: string): string {
    return logError({
        category: 'miniapp_load',
        severity: 'high',
        message: `Échec du chargement de la Mini-App "${appName}"`,
        component: context,
        extra: { error: error.message },
    });
}

/** Tracer une erreur réseau */
export function logNetworkError(error: Error, url?: string): string {
    return logError({
        category: 'network',
        severity: 'medium',
        message: 'Erreur réseau détectée',
        component: 'Network',
        extra: { error: error.message, url },
    });
}

/** Tracer une erreur Sanity */
export function logSanityError(error: Error, operation: string): string {
    return logError({
        category: 'sanity',
        severity: 'high',
        message: `Erreur lors de l'opération "${operation}" sur Sanity`,
        component: 'Sanity',
        extra: { error: error.message, operation },
    });
}

/** Tracer une erreur Firebase */
export function logFirebaseError(error: Error, operation: string): string {
    return logError({
        category: 'firebase',
        severity: 'high',
        message: `Erreur Firebase lors de "${operation}"`,
        component: 'Firebase',
        extra: { error: error.message, operation },
    });
}

/** Tracer un échec de mise à jour */
export function logUpdateError(error: Error, appId: string): string {
    return logError({
        category: 'update',
        severity: 'medium',
        message: `Échec de la mise à jour de la Mini-App ${appId}`,
        component: 'Update',
        extra: { error: error.message, appId },
    });
}

/** Tracer un crash WebView */
export function logWebViewError(error: Error, appId: string): string {
    return logError({
        category: 'webview',
        severity: 'critical',
        message: `Crash WebView pour la Mini-App ${appId}`,
        component: 'WebView',
        extra: { error: error.message, appId },
    });
}

export default { logError, getErrors, clearErrors, logMiniAppLoadError, logNetworkError, logSanityError, logFirebaseError, logUpdateError, logWebViewError };