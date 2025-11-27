import type { Request, Response, RequestHandler } from 'express';
import axios from 'axios';
import { app } from '@/lib/express';

// Configuration GitHub
const GITHUB_OWNER = 'DiiageCUCDB';
const GITHUB_REPO = 'DI1-P2-Gr2-Kotlin';
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

// Interface pour les assets GitHub
interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  download_count: number;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  assets: GitHubAsset[];
}

/**
 * Handler pour télécharger la dernière APK
 */
export const downloadLatestHandler: RequestHandler = async (
  request: Request,
  reply: Response
): Promise<void> => {
  try {
    app.logger.info('Download latest APK requested');

    const response = await axios.get<GitHubRelease>(`${GITHUB_API_BASE}/releases/latest`, {
      headers: {
        'User-Agent': 'API-Download-Server',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const release = response.data;
    const apkAsset = release.assets.find(asset => 
      asset.name.includes('.apk') && !asset.name.includes('unsigned')
    );

    if (!apkAsset) {
      app.logger.warn('No APK found in latest release', { tag: release.tag_name });
      reply.status(404).json({
        success: false,
        error: 'Aucun APK trouvé dans la dernière release'
      });
      return;
    }

    app.logger.info('Redirecting to latest APK', { 
      version: release.tag_name,
      apk: apkAsset.name,
      url: apkAsset.browser_download_url
    });

    // Rediriger vers le fichier APK
    reply.redirect(302, apkAsset.browser_download_url);
  } catch (error: any) {
    app.logger.error('Error downloading latest APK', { error: error.message });

    if (error.response?.status === 404) {
      reply.status(404).json({
        success: false,
        error: 'Aucune release trouvée'
      });
      return;
    }

    reply.status(500).json({
      success: false,
      error: 'Erreur lors du téléchargement de l\'APK',
      details: error.response?.data?.message || error.message
    });
  }
};

/**
 * Handler pour télécharger une version spécifique
 */
export const downloadVersionHandler: RequestHandler<{ version: string }> = async (
  request: Request<{ version: string }>,
  reply: Response
): Promise<void> => {
  try {
    const { version } = request.params;
    app.logger.info('Download specific version APK requested', { version });

    const response = await axios.get<GitHubRelease>(`${GITHUB_API_BASE}/releases/tags/${version}`, {
      headers: {
        'User-Agent': 'API-Download-Server',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const release = response.data;
    const apkAsset = release.assets.find(asset => 
      asset.name.includes('.apk') && !asset.name.includes('unsigned')
    );

    if (!apkAsset) {
      app.logger.warn('No APK found for version', { version });
      reply.status(404).json({
        success: false,
        error: `Aucun APK trouvé pour la version ${version}`
      });
      return;
    }

    app.logger.info('Redirecting to version APK', { 
      version: release.tag_name,
      apk: apkAsset.name,
      url: apkAsset.browser_download_url
    });

    // Rediriger vers le fichier APK
    reply.redirect(302, apkAsset.browser_download_url);
  } catch (error: any) {
    app.logger.error(`Error downloading APK for version ${request.params.version}`, { 
      error: error.message 
    });

    if (error.response?.status === 404) {
      reply.status(404).json({
        success: false,
        error: `Version ${request.params.version} non trouvée`
      });
      return;
    }

    reply.status(500).json({
      success: false,
      error: 'Erreur lors du téléchargement de l\'APK',
      details: error.response?.data?.message || error.message
    });
  }
};

/**
 * Handler pour obtenir les informations de la dernière release (optionnel)
 */
export const getLatestReleaseInfoHandler: RequestHandler = async (
  request: Request,
  reply: Response
): Promise<void> => {
  try {
    app.logger.info('Get latest release info requested');

    const response = await axios.get<GitHubRelease>(`${GITHUB_API_BASE}/releases/latest`, {
      headers: {
        'User-Agent': 'API-Download-Server',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const release = response.data;
    const apkAsset = release.assets.find(asset => 
      asset.name.includes('.apk') && !asset.name.includes('unsigned')
    );

    const releaseInfo = {
      tag_name: release.tag_name,
      name: release.name,
      apk_available: !!apkAsset,
      apk_info: apkAsset ? {
        name: apkAsset.name,
        download_url: apkAsset.browser_download_url,
        size: apkAsset.size,
        download_count: apkAsset.download_count
      } : null,
      all_assets: release.assets.map(asset => ({
        name: asset.name,
        download_url: asset.browser_download_url,
        size: asset.size,
        download_count: asset.download_count
      }))
    };

    reply.json({
      success: true,
      release: releaseInfo
    });
  } catch (error: any) {
    app.logger.error('Error getting latest release info', { error: error.message });

    if (error.response?.status === 404) {
      reply.status(404).json({
        success: false,
        error: 'Aucune release trouvée'
      });
      return;
    }

    reply.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des informations de release',
      details: error.response?.data?.message || error.message
    });
  }
};