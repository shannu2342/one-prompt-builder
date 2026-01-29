import axios from 'axios';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify';
  projectName: string;
  files: { [key: string]: string };
  token: string;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  error?: string;
}

export class DeploymentService {
  async deployToVercel(config: DeploymentConfig): Promise<DeploymentResult> {
    try {
      const { projectName, files, token } = config;

      // Create deployment payload
      const deploymentPayload = {
        name: projectName,
        files: Object.entries(files).map(([file, content]) => ({
          file,
          data: Buffer.from(content).toString('base64'),
        })),
        projectSettings: {
          framework: null,
        },
      };

      const response = await axios.post(
        'https://api.vercel.com/v13/deployments',
        deploymentPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        url: `https://${response.data.url}`,
        deploymentId: response.data.id,
      };
    } catch (error: any) {
      console.error('Vercel deployment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async deployToNetlify(config: DeploymentConfig): Promise<DeploymentResult> {
    try {
      const { projectName, files, token } = config;

      // Create a site first
      const siteResponse = await axios.post(
        'https://api.netlify.com/api/v1/sites',
        {
          name: projectName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const siteId = siteResponse.data.id;

      // Deploy files
      const deployPayload = {
        files: Object.entries(files).reduce((acc, [file, content]) => {
          acc[file] = Buffer.from(content).toString('base64');
          return acc;
        }, {} as { [key: string]: string }),
      };

      const deployResponse = await axios.post(
        `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
        deployPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        url: siteResponse.data.url,
        deploymentId: deployResponse.data.id,
      };
    } catch (error: any) {
      console.error('Netlify deployment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async createZipExport(projectName: string, files: { [key: string]: string }): Promise<string> {
    return new Promise((resolve, reject) => {
      const exportDir = path.join(process.cwd(), 'exports');
      const zipPath = path.join(exportDir, `${projectName}-${Date.now()}.zip`);

      // Create exports directory if it doesn't exist
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Add files to archive
      Object.entries(files).forEach(([filename, content]) => {
        archive.append(content, { name: filename });
      });

      archive.finalize();
    });
  }

  async deploy(config: DeploymentConfig): Promise<DeploymentResult> {
    if (config.platform === 'vercel') {
      return this.deployToVercel(config);
    } else if (config.platform === 'netlify') {
      return this.deployToNetlify(config);
    } else {
      return {
        success: false,
        error: 'Unsupported deployment platform',
      };
    }
  }
}

export const deploymentService = new DeploymentService();
