const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

var Positioning = new GObject.Class({
    Name: 'Positioning',
    _init: function (sourceButton) {
        this.button = sourceButton;
        this.extensionEnabled = false;
        this.orderChanging = false;
        this.buttonAttached = false;
    },

    enable() {
        this.extensionEnabled = true
        this.settings = Convenience.getSettings()
        this.settings.connect('changed::position', Lang.bind(this, this._setPosition));
        this.settings.connect('changed::order', Lang.bind(this, this._setOrder));

        Main.panel._rightBox.connect('actor_added', Lang.bind(this, function (self, actor) {
            if (actor && actor !== this.button &&
                !this.orderChanging &&
                this.extensionEnabled) {
                this._setOrder()
            }
        }));
        // Main.panel._rightBox.connect('actor_removed', function (self, actor) {
        //     if (actor !== button && !orderChanging && button) {
        //         setOrder()
        //     }
        // });

        this._setOrder()
    },

    disable() {
        this.extensionEnabled = false
        this.buttonAttached = false
        Main.panel._rightBox.remove_child(this.button);
    },

    _setPosition() {
        let position = this.settings.get_string('position');
        log("###" + position)
    },

    _setOrder() {
        this.orderChanging = true
        if (this.buttonAttached) {
            Main.panel._rightBox.remove_child(this.button);
        }
        Main.panel._rightBox.insert_child_at_index(
            this.button, this.settings.get_int('order'));
        this.orderChanging = false
        this.buttonAttached = true
    }
});
