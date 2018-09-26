/// <binding />
module.exports = {
    makeTargetSpecificConfig: () => {
        return {
            devtool: 'inline-source-map',
            output: {
                chunkFilename: '[id].js'
            }
        };
    }
};
