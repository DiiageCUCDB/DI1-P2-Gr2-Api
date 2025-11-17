// Import the OpenAPI registry from the local file
import registry from './openAPIRegistry';

import { httpsPort, url, packageJson, productionUrl } from '@/lib/config/env.config';

// Import the OpenApiGeneratorV3 class from the zod-to-openapi package
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';


// Function to generate the OpenAPI document
export const docs = () => {
    // Create a new instance of OpenApiGeneratorV3 with the registry definitions
    const generator = new OpenApiGeneratorV3(registry.definitions);

    // Generate the OpenAPI document with the specified configuration
    const openApiDocument = generator.generateDocument({
        openapi: '3.0.0', // OpenAPI version
        info: {
            title: packageJson.name, // Title of the API
            version: packageJson.version, // Version of the API
            // Description of the API
        },
        servers: [
            {
                url: `${url}:${httpsPort}`,
                description: 'Development server'
            }, // Development server URL
            {
                url: `${productionUrl}`,
                description: 'Production server'
            }, // Production server URL
        ],
    });

    // Return the generated OpenAPI document
    return openApiDocument;
};