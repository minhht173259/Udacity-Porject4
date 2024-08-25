import jsonwebtoken from 'jsonwebtoken'
import {createLogger} from '../../utils/logger.mjs'
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";


const logger = createLogger('auth')

export async function handler(event) {
    try {
        const jwtToken = await verifyToken(event.authorizationToken)
        logger.info("Authenticate user successfully: ", {jwtToken})

        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.error('User not authorized', {error: e})

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

async function verifyToken(authHeader) {
    const token = getToken(authHeader)
    const jwt = jsonwebtoken.decode(token, {complete: true})
    const certification = await getCredential();
    logger.info("Authentication Info: ", jwt)
    // OAth -> get UserInfo and then verify it by parsing
    try {
        return jsonwebtoken.verify(token, certification, {algorithms: ['RS256']})
    } catch (err) {
        logger.info("Authentication exception", {
            error: err
        })
        throw err
    }

}

async function getCredential() {
    const secret_name = "dev/credentail";
    const client = new SecretsManagerClient({
        region: "us-east-1",
    });

    try {
        console.log("Getting Secret Credential...")
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
        console.log("Secret getting successfully !!!", response)
        return response.SecretString;
    } catch (error) {
        console.error("Error: ", error)
        throw error
    }
}

function getToken(authHeader) {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return token
}

function getKey(header, callback) {
    logger.info("Getting Authentication Key of JWTKS")
    jwtClient.getSigningKey(header.kid, function (err, key) {
        var signingKey = key.publicKey || key.rsaPublicKey;
        logger.info("Signing Key", {
            signingKey
        })
        callback(null, signingKey);
    });
}
