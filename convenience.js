const Gettext = imports.gettext;
const Gio = imports.gi.Gio;

const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;

function initTranslations(domain) {
    // let extension = ExtensionUtils.getCurrentExtension();
    // domain = domain || extension.metadata['gettext-domain'];
    // let localeDir = extension.dir.get_child('locale');
    // if (localeDir.query_exists(null))
    //     Gettext.bindtextdomain(domain, localeDir.get_path());
    // else
    //     Gettext.bindtextdomain(domain, Config.LOCALEDIR);
}

function getSettings() {
    let extension = ExtensionUtils.getCurrentExtension();
    let schema = extension.metadata['settings'];

    const GioSSS = Gio.SettingsSchemaSource;
    let schemaDir = extension.dir.get_child('./schema');
    let schemaSource;
    if (schemaDir.query_exists(null))
        schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
            GioSSS.get_default(),
            false);
    else
        schemaSource = GioSSS.get_default();

    let schemaObj = schemaSource.lookup(schema, true);
    if (!schemaObj)
        throw new Error('Schema ' + schema + ' could not be found for extension '
            + extension.metadata.uuid + '. Please check your installation.');

    return new Gio.Settings({settings_schema: schemaObj});
}
