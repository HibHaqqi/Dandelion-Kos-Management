export interface ServerApp {
  id: string;
  name: string;
  icon: string;
  url: string;
  description: string;
  category: 'media' | 'requests' | 'smart-home' | 'other';
}

export const SERVER_APPS: ServerApp[] = [
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    icon: '📺',
    url: 'http://192.168.1.100:8096',
    description: 'Media Streaming Server',
    category: 'media',
  },
  {
    id: 'jellyseerr',
    name: 'Jellyseerr',
    icon: '🎬',
    url: 'http://192.168.1.100:5055',
    description: 'Movie & Show Requests',
    category: 'requests',
  },
  {
    id: 'home-assistant',
    name: 'Home Assistant',
    icon: '🏠',
    url: 'http://192.168.1.100:8123',
    description: 'Smart Home Control',
    category: 'smart-home',
  },
];

// You can add more apps here or load from environment variables
// Example:
// export const SERVER_APPS = JSON.parse(process.env.SERVER_APPS_CONFIG || '[]');
