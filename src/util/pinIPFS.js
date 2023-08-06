// const pinataSDK = require('@pinata/sdk')
// const pinataApiKey = "1e57bed1d89a30e5a5a7";
// const pinataSecretApiKey = "81e1b6cf23942787bf6a8b55cd83ac96ab46a37600e48b146d0a2a55d0f4f79a";
// const pinata = pinataSDK(pinataApiKey,pinataSecretApiKey)

// const fs = require('fs');
// const readableStreamForFile = fs.createReadStream('../../public/logo192.png');
// pinata.pinFileToIPFS(readableStreamForFile).then((result) => {
//     //handle results here
//     console.log(result['IpfsHash']);
// }).catch((err) => {
//     //handle error here
//     console.log(err);
// });


const ipfsClient = require('ipfs-http-client');
const projectId = '2T3Zx5gaSCdLkwoBqHiztEVpfPA';
const projectSecret = '3597faaa0297b05d8ad41ab87a65d451';
const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = ipfsClient.create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});
client.add('Hello World').then((res) => {
    console.log(res);
});