const { override } = require("customize-cra");

const overrideEntry = (config) => {
	config.entry = {
		main: "./src/popup",
		background: "./src/background",
		content: "./src/content",
		newtab: "./src/newtab",
		pinned: "./src/pinned",
	};

	return config;
};

const overrideOutput = (config) => {
	config.output = {
		...config.output,
		filename: "static/js/[name].js",
		chunkFilename: "static/js/[name].js",
	};

	return config;
};

module.exports = {
	webpack: (config) => override(overrideEntry, overrideOutput)(config),
};
