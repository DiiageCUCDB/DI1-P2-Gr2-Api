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
  [x: string]: any;
  id: number;
  tag_name: string;
  name: string;
  assets: GitHubAsset[];
}

/**
 * Handler pour télécharger la dernière APK
 */
export const downloadLatestHandler: RequestHandler = async (
  _request: Request,
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
 * Handler to get all releases
 */
export const getAllReleasesHandler: RequestHandler = async (
  _request: Request,
  reply: Response
): Promise<void> => {
  try {
    app.logger.info('Get all releases requested');

    const response = await axios.get<GitHubRelease[]>(`${GITHUB_API_BASE}/releases`, {
      headers: {
        'User-Agent': 'API-Download-Server',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const releases = response.data.map(release => {
      const apkAsset = release.assets.find(asset => 
        asset.name.includes('.apk') && !asset.name.includes('unsigned')
      );

      return {
        id: release.id,
        tag_name: release.tag_name,
        name: release.name,
        published_at: release.published_at,
        apk_available: !!apkAsset,
        apk_info: apkAsset ? {
          name: apkAsset.name,
          download_url: apkAsset.browser_download_url,
          size: apkAsset.size,
          download_count: apkAsset.download_count
        } : null
      };
    });

    reply.json({
      success: true,
      releases
    });
  } catch (error: any) {
    app.logger.error('Error getting all releases', { error: error.message });

    reply.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des releases',
      details: error.response?.data?.message || error.message
    });
  }
};