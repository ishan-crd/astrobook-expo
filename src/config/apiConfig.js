// API Configuration
// Switch between production and local by changing USE_LOCAL_API

const USE_LOCAL_API = false; // Set to true for local development

const PRODUCTION_API = 'https://api.acharyalavbhushan.com/api';
const LOCAL_API = 'https://alb.gennextit.com/api';

const api = USE_LOCAL_API ? LOCAL_API : PRODUCTION_API;

export default api;
