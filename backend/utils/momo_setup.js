const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Script to generate MoMo API User and API Key
 * Replace the SUBSCRIPTION_KEY with yours
 */

const SUBSCRIPTION_KEY = 'f32591c0eaba40bdb5a5cad407d5450a';
const BASE_URL = 'https://sandbox.momodeveloper.mtn.com';

const setupMoMo = async (key, name) => {
    try {
        const apiUser = uuidv4();
        console.log(`\n--- Testing ${name} ---`);
        console.log(`Step 1: Creating API User for ${key}...`);

        await axios.post(
            `${BASE_URL}/v1_0/apiuser`,
            { providerCallbackHost: 'localhost' },
            {
                headers: {
                    'X-Reference-Id': apiUser,
                    'Ocp-Apim-Subscription-Key': key.trim(),
                },
            }
        );

        console.log('✅ API User created');

        console.log('Step 2: Generating API Key...');
        const response = await axios.post(
            `${BASE_URL}/v1_0/apiuser/${apiUser}/apikey`,
            {},
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': key.trim(),
                },
            }
        );

        const apiKey = response.data.apiKey;
        console.log('✅ API Key generated');

        console.log('\n--- SUCCESS! COPY THESE ---');
        console.log(`MTN_MOMO_SUBSCRIPTION_KEY=${key.trim()}`);
        console.log(`MTN_MOMO_API_USER=${apiUser}`);
        console.log(`MTN_MOMO_API_KEY=${apiKey}`);
        console.log('--------------------------\n');

    } catch (error) {
        console.error(`❌ Error with ${name}:`, error.response?.status, error.response?.data || error.message);
    }
};

const run = async () => {
    await setupMoMo('35da4b2599b44ce49bc2acfc32b9e283', 'Primary Key');
    await setupMoMo('f32591c0eaba40bdb5a5cad407d5450a', 'Secondary Key');
};

run();

