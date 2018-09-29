/// <binding />
module.exports = {
    makeTargetSpecificConfig: () => {
        return {
            output: {
                chunkFilename: '[id].js'
            }
        };
    }
};
