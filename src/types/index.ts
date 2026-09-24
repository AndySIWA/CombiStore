/**
 * Type de source pour une Mini-App.
 * - `url`: L'application est chargée depuis une adresse Web externe.
 * - `html`: L'application est injectée directement sous forme de chaîne HTML.
 */
export type SourceType = 'url' | 'html';

/**
 * Représente une catégorie d'applications dans le catalogue CombiStore.
 */
export interface Category {
  /** Identifiant unique de la catégorie */
  id: string;
  /** Nom d'affichage de la catégorie */
  name: string;
  /** Couleur associée pour l'affichage visuel (ex: code hexadécimal) */
  color: string;
  /** Nom de l'icône (ex: icône Ionicons ou MaterialIcons) */
  icon: string;
}

/**
 * Représente une Mini-App enregistrée dans l'application CombiStore.
 */
export interface MiniApp {
  /** Identifiant unique local ou distant */
  id: string;
  /** Nom de l'application */
  name: string;
  /** Description détaillée du rôle et des fonctionnalités */
  description: string;
  /** Identifiant de la catégorie à laquelle appartient l'app */
  categoryId: string;
  /** Type de la source (URL ou HTML) */
  sourceType: SourceType;
  /** Adresse URL pour le type 'url' ou code HTML brut pour le type 'html' */
  source: string;
  /** URL ou nom d'icône d'illustration */
  icon: string;
  /** Horodatage d'ajout (timestamp en millisecondes) */
  addedAt: number;
  /** Identifiant distant optionnel (ex: ID Sanity CMS) */
  remoteId?: string;
  /** Numéro de version optionnel (ex: '1.0.0') */
  version?: string;
  /** Date de dernière mise à jour optionnelle */
  lastUpdated?: string;
}

/**
 * Représente une application distante issue du registry ou du CMS Sanity.
 */
export interface RemoteApp extends Omit<MiniApp, 'addedAt' | 'id'> {
  /** Identifiant unique distant */
  id: string;
}

/**
 * Registre distant contenant la liste des applications et les métadonnées de versioning.
 */
export interface RemoteRegistry {
  /** Version du registre distant */
  version: string;
  /** Horodatage de mise à jour du registre */
  lastUpdated: number;
  /** Liste des applications distantes disponibles */
  apps: RemoteApp[];
}
