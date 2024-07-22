const ConfigMaps = require("../../config/configMaps");
const FS = require("fs");
class RegexConfig {
    static path = process.env.CONFIG_ENVIRONMENT_PROFILE ? ConfigMaps.DefaultValues.ConfigmapPath_REGEX : ConfigMaps.DefaultValues.ConfigmapLocalPath_REGEX;
    // static path = "C:/app/config/regex.json";
    static config = JSON.parse(FS.readFileSync(this.path, 'utf-8'));
    static listeners = [];

    static get regMapping() {
        return this.config["RegMapping"];
    }

    static set regMapping(value) {
        this.config["RegMapping"] = value;
        this.notifyListeners("regMapping", value);
    }

    static get regularExpressions() {
        return this.config["RegularExpression"];
    }

    static set regularExpressions(value) {
        this.config["RegularExpression"] = value;
        this.notifyListeners("regularExpressions", value);
    }

    static loadRegexFromFile(configObject) {
        return JSON.parse(FS.readFileSync(this.path, 'utf-8'))[configObject];
    }

    static notifyListeners(propertyName, value) {
        this.listeners.forEach(listener => {
            listener(propertyName, value);
        });
    }

    static addListener(listener) {
        this.listeners.push(listener);
    }

    static initialize() {
        this.regMapping = this.loadRegexFromFile("RegMapping");
        this.regularExpressions = this.loadRegexFromFile("RegularExpression");
    }
}

module.exports = RegexConfig;