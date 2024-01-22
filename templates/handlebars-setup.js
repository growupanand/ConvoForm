module.exports = function (Handlebars) {
    Handlebars.registerHelper('jsonSafeString', function (string) {
        // Replace special JSON characters with their escaped counterparts
        const escapedString = string.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
        return new Handlebars.SafeString(escapedString);
    });
};