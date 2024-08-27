import { app, HOST_NAME, port } from './api';

/**
 * Express Server
 */
app.listen(port, () => {
    console.log(`API server is running on http://${HOST_NAME}:${port} in ${app.settings.env} mode`);
});