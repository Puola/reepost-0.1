export class OAuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public platform: string
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

export function handleOAuthError(error: unknown, platform: string): string {
  // Log error details for debugging
  if (error instanceof Error) {
    console.error(`OAuth error for ${platform}:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } else {
    console.error(`OAuth error for ${platform}:`, error);
  }

  // Handle specific Google OAuth errors
  if (error && typeof error === 'object' && 'error' in error) {
    const googleError = error as { error: string; error_description?: string };
    switch (googleError.error) {
      case 'popup_blocked':
        return 'Les popups sont bloqués. Veuillez les autoriser pour ce site.';
      case 'redirect_uri_mismatch':
        return 'L\'URL de redirection n\'est pas autorisée. Veuillez contacter le support.';
      case 'invalid_client':
        return 'Configuration incorrecte. Veuillez contacter le support.';
      case 'unauthorized_client':
        return 'Ce client n\'est pas autorisé. Veuillez contacter le support.';
      case 'popup_closed_by_user':
        return 'La fenêtre de connexion a été fermée. Veuillez réessayer.';
      case 'access_denied':
        return 'Vous avez refusé l\'accès à votre compte. Veuillez réessayer en autorisant l\'accès.';
      default:
        return googleError.error_description || 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
    }
  }

  // Handle OAuthError instances
  if (error instanceof OAuthError) {
    switch (error.code) {
      case 'access_denied':
        return 'Vous avez refusé l\'accès à votre compte.';
      case 'invalid_scope':
        return 'Les autorisations demandées ne sont pas valides.';
      case 'invalid_request':
        return 'La requête est invalide. Veuillez réessayer.';
      case 'server_error':
        return 'Une erreur est survenue sur les serveurs de la plateforme.';
      case 'temporarily_unavailable':
        return 'Le service est temporairement indisponible.';
      case 'token_error':
        return 'Erreur lors de la connexion. Veuillez réessayer.';
      case 'popup_error':
        return 'Erreur lors de l\'ouverture de la fenêtre de connexion. Veuillez vérifier que les popups sont autorisés.';
      case 'popup_closed_by_user':
        return 'La fenêtre de connexion a été fermée. Veuillez réessayer.';
      default:
        return error.message;
    }
  }

  // Handle error as string
  if (typeof error === 'string') {
    return error;
  }

  // Handle empty, undefined or unknown error
  return 'Une erreur inconnue est survenue. Veuillez réessayer.';
}